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
    iv: str

    class Config:
        schema_extra = {
            "example": {
                "safe_payload": ("The dark side of the Force is a pathway to many")
                + (" abilities some consider to be unnatural"),
                "enc_data_key": "someencryptedstring",
                "enc_vault_key": "someencryptedstring",
                "iv": "base64InitialisationVector",
            }
        }


class Message(BaseModel):
    message: str

    class Config:
        scheme_extra = {"example": {"message": "status message on API call"}}
