"""
This file is part of WebSafe and has been contributed by https://github.com/mhorst00.

WebSafe is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
"""

from pydantic import BaseModel, EmailStr


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: str | None = None


class User(BaseModel):
    username: EmailStr

    class Config:
        schema_extra = {"example": {"username": "boaty@mcboatface.com"}}


class UserResponse(User):
    full_name: str

    class Config:
        schema_extra = {
            "example": {
                "username": "boaty@mcboatface.com",
                "full_name": "Boaty McBoatface",
            }
        }


class UserNew(User):
    full_name: str
    password: str

    class Config:
        schema_extra = {
            "example": {
                "username": "boaty@mcboatface.com",
                "full_name": "Boaty McBoatface",
                "password": "password",
            }
        }


class UserInDB(User):
    full_name: str
    hashed_password: str
    safe_id: str

    class Config:
        schema_extra = {
            "example": {
                "full_name": "BoatyMcBoatface",
                "username": "boaty@mcboatface.com",
                "hashed_password": "hashedpassword",
                "safe_id": "BoatyMcBoatface",
            }
        }


class UserInDBDel(UserInDB):
    del_string: str

    class Config:
        schema_extra = {
            "example": {
                "full_name": "BoatyMcBoatface",
                "username": "boaty@mcboatface.com",
                "hashed_password": "hashedpassword",
                "safe_id": "BoatyMcBoatface",
                "del_string": "BoatysUniqueDeletionString",
            }
        }


class SafePayload(BaseModel):
    safe_payload: str
    enc_data_key: str
    enc_vault_key: str
    data_iv: str
    vault_iv: str

    class Config:
        schema_extra = {
            "example": {
                "safe_payload": ("The dark side of the Force is a pathway to many")
                + (" abilities some consider to be unnatural"),
                "enc_data_key": "someencryptedstring",
                "enc_vault_key": "someencryptedstring",
                "data_iv": "base64InitialisationVector",
                "vault_iv": "base64InitialisationVector",
            }
        }


class Message(BaseModel):
    message: str

    class Config:
        scheme_extra = {"example": {"message": "status message on API call"}}
