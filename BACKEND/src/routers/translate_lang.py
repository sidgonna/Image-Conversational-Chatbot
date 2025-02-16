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
from pydantic import BaseModel
from src.models.translation_service import detect_language, translate_to_english, translate_to_telugu

router = APIRouter()

class TextRequest(BaseModel):
    text: str

@router.post("/translate/english/")
def translate_to_english_api(request: TextRequest):
    """
    API to translate text to English.
    """
    translated_text = translate_to_english(request.text)
    if "Error" in translated_text:
        raise HTTPException(status_code=400, detail="Error occurred during translation.")
    return {"translated_text": translated_text}

@router.post("/translate/telugu/")
def translate_to_telugu_api(request: TextRequest):
    """
    API to translate text to Telugu.
    """
    translated_text = translate_to_telugu(request.text)
    if "Error" in translated_text:
        raise HTTPException(status_code=400, detail="Error occurred during translation.")
    return {"translated_text": translated_text}

@router.post("/detect-language/")
def detect_language_api(request: TextRequest):
    """
    API to detect the language of the provided text.
    """
    language = detect_language(request.text)
    return {"detected_language": language}
