from pydantic import BaseModel, Field, EmailStr

class UserFullSchema(BaseModel):
    username: str = Field(...)
    email: EmailStr = Field(...)
    password: str = Field(...)
    safe: str = username

    class Config:
        schema_extra = {
            "example": {
                "username": "BoatyMcBoatface",
                "email": "boaty@mcboatface.com",
                "password": "boatyisabadpassword",
                "safe": "BoatyMcBoatface"
            }
        }

class UserLoginSchema(BaseModel):
    email: EmailStr = Field(...)
    password: str = Field(...)

    class Config:
        schema_extra = {
            "example": {
                "email": "boaty@mcboatface.com",
                "password": "boatyisabadpassword"
            }
        }