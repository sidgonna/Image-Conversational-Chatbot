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


from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime

class Message(BaseModel):
    content: str
    sender: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class Thread(BaseModel):
    id: Optional[str]
    title: str
    messages: List[Message] = []
    user_id: str

class Upload(BaseModel):
    base64: List[str]

class Embed(BaseModel):
    text:str

class Query(BaseModel):
    query:Dict[str, str]
