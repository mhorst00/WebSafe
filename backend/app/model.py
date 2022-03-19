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


class SafePayloadNew(BaseModel):
    safePayload: str

    class Config:
        schema_extra = {
            "example": {
                "safePayload": ("The dark side of the Force is a pathway to many")
                + (" abilities some consider to be unnatural")
            }
        }


class Message(BaseModel):
    message: str

    class Config:
        scheme_extra = {"example": {"message": "status message on API call"}}


class Error(BaseModel):
    detail: str

    class Config:
        scheme_extra = {"example": {"detail": "status message on error in API call"}}
