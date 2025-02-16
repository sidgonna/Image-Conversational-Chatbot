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

from deep_translator import GoogleTranslator, detection
from langdetect import detect

def detect_language(text: str) -> str:
    """
    Detects the language of the given text using deep_translator detector.
    """
    try:
        language = detection(text)
        print(f"Detected language: {language}")
        return language
    except Exception as e:
        return str(e)

def translate_to_english(text: str) -> str:
    """
    Translates the given text to English using Google Translator.
    """
    print(f"Translating to English: {text}")
    try:
        translated_text = GoogleTranslator(source='auto', target='en').translate(text)
        return translated_text
    except Exception as e:
        return str(e)

def translate_to_telugu(text: str) -> str:
    """
    Translates the given text to Telugu using Google Translator.
    """
    print(f"Translating to Telugu: {text}")
    try:
        translated_text = GoogleTranslator(source='auto', target='te').translate(text)
        return translated_text
    except Exception as e:
        return str(e)
