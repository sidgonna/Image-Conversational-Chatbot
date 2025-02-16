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
from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List, Union
from src.routers.auth import user_dependency, create_access_token
from src.models.user import is_user_exist, get_user
from starlette import status
from bson import ObjectId
from database import user_collection
from src.routers.auth import bcrypt_context
from src.schemas.user import ChangePasswordBody,EditProfileBody
router = APIRouter()


@router.post("/v1/change-password")
def change_password(change_password_body : ChangePasswordBody, user : user_dependency):
    user_details = user_collection.find_one({"_id" : ObjectId(user['userId'])})
    if not user_details:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not exist.")
    if not user_details['verified']:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='User not Verified')
    hashed_password = bcrypt_context.hash(change_password_body.password)
    response = user_collection.update_one({"_id": ObjectId(user['userId'])}, {"$set" : {"password" : hashed_password}})
    if response.modified_count:
        return {"data" : {"msg"  : "User password change successfull"}}
    else:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Something went wrong while changing the password")
