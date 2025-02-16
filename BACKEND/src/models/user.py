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


from database import user_collection
from bson import ObjectId
from datetime import datetime, timezone

users_schema = {
    "name": None,
    "password": None,
    "email": None,
    "createdAt": None,
    "updatedAt": None,
    "verification_code": None,
    "verified": None,
    "verification_expiry": None
}



def get_user(email: str):
    try:
        user_details = user_collection.find_one({"email": email},{"_id": 1, "password": 0, "verification_code": 0, "verification_expiry": 0, "createdAt": 0, "updatedAt": 0})
        print(user_details)
        if not user_details:
            return False
        else:
            user_details['userId'] = str(user_details['_id'])
            del user_details['_id']
            return user_details
    except Exception as e:
        print(e)
        return False

def is_user_exist(email: str):
    try:
        user_details = user_collection.find_one({"email": email})
        if not user_details:
            return False
        else:
            user_details['userId'] = str(user_details['_id'])
            del user_details['_id']
            return user_details
    except Exception as e:
        print(e)
        return False

def create_user(name: str, email: str, password: str):
    try:
        print("Creating user")
        print(name,email, password)
        doc = users_schema.copy()
        doc['name'] = name
        doc['email'] = email
        doc['password'] = password
        doc['createdAt'] = datetime.now(timezone.utc)
        doc['updatedAt'] = datetime.now(timezone.utc)
        result = user_collection.insert_one(doc)
        print(result.inserted_id)
        if result.inserted_id:
            return result.inserted_id
        else:
            return False
    except Exception as e:
        print(e)
        return False

