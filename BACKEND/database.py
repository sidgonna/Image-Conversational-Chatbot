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

from pymongo import MongoClient
import os
from dotenv import load_dotenv
from datetime import datetime
import uuid
load_dotenv()

mongo_client = MongoClient(os.getenv('MONGO_URI'))
vector_database=mongo_client['embedding_db']
dl_database=mongo_client['dl_db']
chat_collection=dl_database['user']
images_collection=dl_database['images']
vector_collection=vector_database['embeddings']

development_database = mongo_client['development']
user_collection = development_database['user']


def add_message(type,_from,value=None,base64=None):
    now = datetime.now()
    formatted_datetime = now.strftime('%d-%m-%Y %H:%M:%S')
    maindoc={
'datetime':formatted_datetime,
'type':type,
'from':_from,
'value':value
}
    if type=='image':
        unique_id = str(uuid.uuid4())
        doc={
            'imageId':unique_id,
            'base64':base64
        }
        images_collection.insert_one(doc)
        maindoc['value']=unique_id
    is_empty = chat_collection.find_one() is None
    if is_empty:
        impdoc={
            'userId':'admin',
            'chatshistory':[maindoc]
        }
        chat_collection.insert_one(impdoc)
    else:
        chat_collection.update_one({'userId':'admin'},{'$push':{'chatshistory':maindoc}})




def del_embed(id):
    vector_collection.delete_many({"userId":id})

def clear_images_for_session(session_id):
    images_collection.delete_many({'session_id': session_id})





