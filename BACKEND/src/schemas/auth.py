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


from pydantic import BaseModel, EmailStr,field_validator
from typing import Optional, List



class SignupBody(BaseModel):
    name : str
    email : EmailStr
    password : str
    
    @field_validator('name')
    def name_validator(cls, v, values):
        if not v:
            raise ValueError("Name must not be empty")
        if not isinstance(v, str):
            raise ValueError("Name must be string")
        return v
    
    @field_validator('password')
    def password_validator(cls, v, values):
        min_length = 8
        has_uppercase = any(char.isupper() for char in v)
        has_lowercase = any(char.islower() for char in v)
        has_digit = any(char.isdigit() for char in v)
        has_special_char = any(char in '!@#$%^&*()-_=+`~[]{}|;:,.<>?/' for char in v)

        if len(v) < min_length:
            raise ValueError(f"Password must be at least {min_length} characters long")
        if not has_uppercase:
            raise ValueError("Password must contain at least one uppercase letter")
        if not has_lowercase:
            raise ValueError("Password must contain at least one lowercase letter")
        if not has_digit:
            raise ValueError("Password must contain at least one digit")
        if not has_special_char:
            raise ValueError("Password must contain at least one special character")
        return v

class Token(BaseModel):
    access_token : str
    token_type : str

class ResetPasswordBody(BaseModel):
    email : str