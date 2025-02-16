    # IMAGE-CONVERSATIONAL-CHATBOT is free software: you can redistribute it and/or modify
    # it under the terms of the GNU General Public License as published by
    # the Free Software Foundation, either version 3 of the License, or
    # (at your option) any later version.

    # IMAGE-CONVERSATIONAL-CHATBOT is distributed in the hope that it will be useful,
    # but WITHOUT ANY WARRANTY; without even the implied warranty of
    # MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    # GNU General Public License for more details.

    # You should have received a copy of the GNU General Public License
    # along with IMAGE-CONVERSATIONAL-CHATBOT.  If not, see <https://www.gnu.org/licenses/>.

from fastapi import FastAPI, HTTPException, Request, BackgroundTasks
from pydantic import BaseModel
import numpy as np
from pymongo import MongoClient
from bson.objectid import ObjectId
from sentence_transformers import SentenceTransformer, CrossEncoder
from langchain.text_splitter import RecursiveCharacterTextSplitter, SentenceTransformersTokenTextSplitter
import ollama
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from database import del_embed
import asyncio
from src.models.translation_service import detect_language, translate_to_english, translate_to_telugu
from src.routers.auth import user_dependency
from dotenv import load_dotenv
load_dotenv()
import os

router = APIRouter()

mongo_client = MongoClient(os.getenv('MONGO_URI'))
db = mongo_client["embedding_db"]
embedding_collection = db["embeddings"]

embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

def split_text(text):
    character_splitter = RecursiveCharacterTextSplitter(
        separators=["\n\n", "\n", ". ", " ", ""], chunk_size=1000, chunk_overlap=0
    )
    print('Character splitter initialized.')

    # Split the text into chunks based on character separators
    character_split_texts = character_splitter.split_text(text)
    print(f'Character split texts: {len(character_split_texts)} chunks')

    # Initialize the token text splitter
    model_name = "all-MiniLM-L6-v2"  # Replace with your model name
    token_splitter = SentenceTransformersTokenTextSplitter(
        model_name=model_name, chunk_overlap=0, tokens_per_chunk=256
    )
    print('Token splitter initialized.')

    # Split the character split texts into token chunks
    token_split_texts = []
    for text_chunk in character_split_texts:
        token_split_texts += token_splitter.split_text(text_chunk)
    print(f'Token split texts: {len(token_split_texts)} chunks')

    return token_split_texts


def add_documents_to_mongo(texts,id=None):
    for i, text in enumerate(texts):
        embedding = embedding_model.encode(text).tolist()
        embedding_collection.insert_one({"imgcontext-no":str(i),"text": text, "embedding": embedding,"userId":id})

def generate_queries_and_retrieve_documents(query, id=None,num_results=5):
    def generate_multi_query(query,id=None):
        prompt = """
        You are a knowledgeable conversational image chat bot. 
        For the given question, propose up to five related questions to assist them in finding the information they need. 
        Provide concise, single-topic questions (without compounding sentences) that cover various aspects of the topic. 
        Ensure each question is complete and directly related to the original inquiry. 
        List each question on a separate line without numbering.
        """

        response = ollama.chat(
            model="llama3.1",
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": query},
            ]
        )

        augmented_queries = response['message']['content'].splitlines()
        return augmented_queries
    augmented_queries = generate_multi_query(query)
    joint_query = [query] + augmented_queries
    query_embedding = embedding_model.encode(joint_query).mean(axis=0).tolist()
    cursor = embedding_collection.find({"userId":id})
    results = []
    for document in cursor:
        embedding = document["embedding"]
        score = np.dot(query_embedding, embedding) / (np.linalg.norm(query_embedding) * np.linalg.norm(embedding))
        results.append((score, document["text"]))
    results.sort(reverse=True, key=lambda x: x[0])
    top_documents = [doc for _, doc in results[:num_results]]

    return top_documents

async def generate_final_answer(query, context):
    prompt = """
    You are a knowledgeable conversational image chat bot. 
    Based on the following context, answer the query: '{}'
    """.format(query)
    for chunk in ollama.chat(
        model="llama3.1",
        messages=[
            {"role": "system", "content": prompt},
            {"role": "user", "content": f"Context:\n\n{context}\n\nQuery:\n{query}"},
        ],
        stream=True
    ):
        await asyncio.sleep(0)
        try:
            yield chunk['message']['content']
        except Exception as e:
            yield " "

class TextRequest(BaseModel):
    text: str

class QueryRequest(BaseModel):
    query: str

@router.post("/embed")
async def embed_text(request: TextRequest, user : user_dependency):
    id=user.get('userId', None)
    del_embed(id)
    text = request.text
    print(f"Received text: {text}")
    if detect_language(text) != "en":
        text = translate_to_english(text)
        print(f"Translated text: {text}")
    texts = split_text(text)
    add_documents_to_mongo(texts,id=id)
    return {"message": "Text embedded successfully"}

@router.post("/generate")
async def generate_response(request: QueryRequest, user : user_dependency):
    id=user.get('userId',None)
    query = request.query
    print(f"Received query: {query}")
    if detect_language(query) != "en":
        query = translate_to_english(query)
        print(f"Translated query: {query}")
    top_documents = generate_queries_and_retrieve_documents(query,id=id)
    context = "\n\n".join(top_documents)
    final_answer_lines_stream = generate_final_answer(query, context)
    return StreamingResponse(final_answer_lines_stream, media_type="text/plain")
