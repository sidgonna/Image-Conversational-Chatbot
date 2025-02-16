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


from fastapi import APIRouter, HTTPException
from typing import List
from src.schemas.chat import Upload
from database import add_message
import base64
from io import BytesIO
from PIL import Image
import ollama
from fastapi.responses import StreamingResponse
import asyncio
from src.routers.auth import user_dependency

router = APIRouter()

def compress_base64_image(base64_string, quality=85):
    image_data = base64.b64decode(base64_string)
    image = Image.open(BytesIO(image_data))

    compressed_image_io = BytesIO()
    image.save(compressed_image_io, format='JPEG', quality=quality)
    compressed_image_io.seek(0)

    compressed_base64 = base64.b64encode(compressed_image_io.getvalue()).decode('utf-8')

    return compressed_base64

async def stream_description(images_base64):
    for img_base64 in images_base64:
        for chunk in ollama.chat(
            model="llava:7b",
            messages=[
                {
                    'role': 'user',
                    'content': '''Describe this image in detail, including all possible aspects. Identify the following elements:
                        1. *Objects and Entities:* List all visible objects, people, animals, and other entities. Describe their appearance, color, size, and position in the image.
                        2. *Scene and Setting:* Describe the environment, background, and context. Mention the location, time of day, weather, and any visible landscape or architectural features.
                        3. *Actions and Interactions:* Detail any activities, interactions, or movements occurring in the image. Specify the relationships between the entities.
                        4. *Emotions and Expressions:* Analyze the emotions or expressions of any visible people or animals. Mention any visible signs of mood or atmosphere.
                        5. *Text and Symbols:* Identify any text, symbols, or logos visible in the image. Describe their content, style, and significance.
                        6. *Colors and Lighting:* Describe the dominant colors and lighting conditions. Mention any shadows, highlights, or reflections.
                        7. *Additional Details:* Include any other noteworthy details that contribute to the understanding of the image.''',
                    'images': [img_base64]
                }
            ],
            stream=True
        ):
            await asyncio.sleep(0)
            try:
                yield chunk['message']['content']
            except Exception as e:
                yield " "

@router.post("/upload")
async def upload(data: Upload, user: user_dependency):
    images_base64 = [compress_base64_image(img) for img in data.base64]
    stream = stream_description(images_base64)
    return StreamingResponse(stream, media_type="text/plain")
