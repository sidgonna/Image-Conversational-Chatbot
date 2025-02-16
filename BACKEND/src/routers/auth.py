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

import hashlib
from random import randbytes
from fastapi import APIRouter, Depends, HTTPException, Form
from fastapi.responses import RedirectResponse
from datetime import timedelta, datetime, timezone
from typing import Union, Annotated
from starlette import status
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from jose import jwt, JWTError
import os
from dotenv import load_dotenv
load_dotenv()
from database import user_collection
from src.models.user import is_user_exist, create_user
from emails import send_verification_code, send_reset_code
from bson import ObjectId
from src.schemas.auth import ResetPasswordBody,SignupBody,Token
from pydantic import BaseModel

router = APIRouter(tags=['Auth'])

SECRET_KEY = "k3bk5j76bekj8b4kjhq2v3jh54v25h7j5y7k73g7ghd6jyfd34g67c3l4374p6iu38"
ALGORITHM = "HS256"

bcrypt_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
oauth2_bearer = OAuth2PasswordBearer(tokenUrl='/v1/login')

    
@router.post("/v1/signup", status_code=status.HTTP_201_CREATED)
async def signup(signup_body : SignupBody):
    print(signup_body)
    if is_user_exist(signup_body.email):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="User already exists")
    print('1')
    
    hashed_password = bcrypt_context.hash(signup_body.password)
    inserted_id = create_user(signup_body.name, signup_body.email, hashed_password)
    new_user = user_collection.find_one({'_id': inserted_id})
    print(new_user)
    
    try:
        token = randbytes(10)
        hashedCode = hashlib.sha256()
        hashedCode.update(token)
        verification_code = hashedCode.hexdigest()
        user_collection.find_one_and_update({"_id": inserted_id}, {"$set": {"verification_code": verification_code, "verification_expiry": (datetime.now(timezone.utc) + timedelta(minutes=10)).timestamp()}})
        url = f"http://localhost:8000/v1/verifyemail/{token.hex()}/{inserted_id}"
        await send_verification_code([new_user['email']], url)
    except Exception as error:
        print(error)
        user_collection.find_one_and_update({"_id": inserted_id}, {"$set": {"verification_code": None, "verification_expiry": None}})
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,detail='There was an error sending email')
    return {"data" : {"msg" : "Verification email was sent to your mail"}}

class FormData(BaseModel):
    email: str
    password: str
    
@router.post("/v1/login", response_model=Union[Token, dict])
async def login_for_access_token(form_data:FormData):
    
    user = authenticate_user(form_data.email, form_data.password)
    print(user)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate user.")
    if not user['verified']:
        try: 
            token = randbytes(10)
            hashedCode = hashlib.sha256()
            hashedCode.update(token)
            verification_code = hashedCode.hexdigest()
            user_collection.find_one_and_update({"_id": ObjectId(user['userId'])}, {"$set": {"verification_code": verification_code, "verification_expiry": (datetime.now(timezone.utc) + timedelta(minutes=10)).timestamp()}})
            url = f"http://localhost:8000/v1/verifyemail/{token.hex()}/{ObjectId(user['userId'])}"
            await send_verification_code([user['email']], url)
        except Exception as error:
            user_collection.find_one_and_update({"_id": ObjectId(user['userId'])}, {"$set": {"verification_code": None, "verification_expiry": None}})
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,detail='There was an error sending email')
        return {"data" : {"msg" : "Verification email was sent to your mail"}}
    
    token = create_access_token(str(user['userId']), timedelta(days=10))
    return {"access_token" : token, "token_type" : 'bearer', "userId" : str(user['userId'])}


@router.post("/v1/forgot-password")
async def forgot_password(reset_password_body : ResetPasswordBody):
    user_details = is_user_exist(reset_password_body.email)
    if not user_details['verified']:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='User not Verified')    
    if not user_details:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='User does not exist.')
    
    token = create_access_token(user_details['userId'], timedelta(minutes=10))
    
    url = f"http://localhost:3000/changepassword?token={token}"

    await send_reset_code([user_details['email']], url)
        
    return {"data" : {"msg" : "User password reset options were sent to mail succesfully"}}

    
@router.get('/v1/get_user')
def get_user(tokenid : str):
    response = get_current_user(tokenid)
    return response


@router.get('/v1/verifyemail/{token}/{userid}')
def verify_me(token: str, userid : str):
    hashedCode = hashlib.sha256()
    hashedCode.update(bytes.fromhex(token))
    verification_code = hashedCode.hexdigest()
    result = user_collection.find_one({"verification_code": verification_code, "_id" : ObjectId(userid)}) 
    if not result:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Invalid verification code or account already verified')
    if result['verification_expiry'] <= datetime.now(timezone.utc).timestamp():
        raise HTTPException(status_code=440, detail="Verification code expired.")
    
    user_collection.update_one({"_id" : ObjectId(userid)},{"$set": {"verification_code": None, "verified": True, "verification_expiry" : None}})
    
    # Instead of return put the frontend url for login page
    return RedirectResponse(url="http://localhost:3000/login", status_code=status.HTTP_302_FOUND)

def authenticate_user(email: str, password: str):
    user = is_user_exist(email)
    if not user:
        return False
    if not bcrypt_context.verify(password,user['password']):
        return False
    return user

def create_access_token(id : str,expires_delta : timedelta):
    encode = {'userId' : id}
    expires = datetime.now(timezone.utc) + expires_delta
    encode.update({'exp' : expires})
    return jwt.encode(encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: Annotated[str, Depends(oauth2_bearer)]):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        id: str = payload.get('userId')
        exp : int = payload.get('exp')
        if id is None or exp is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Could not validate user.')
        current_time = datetime.now(timezone.utc)
        expiry_time = datetime.fromtimestamp(exp, timezone.utc)
        if expiry_time <= current_time:
            raise HTTPException(status_code=440, detail='The session is expired.')
        
        return {'userId': id,'exp' : exp}

    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Could not validate user.')
    
user_dependency = Annotated[dict, Depends(get_current_user)]

