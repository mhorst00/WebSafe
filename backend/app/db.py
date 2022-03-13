import pymongo
from decouple import config
from pydantic import validate_arguments
from app.model import UserLoginSchema, UserFullSchema

DB_URL = config("DB_URL", default="localhost")
DB_PORT = config("DB_PORT", default=27017, cast=int)

class Database():
    URI = f"mongodb://{DB_URL}:{DB_PORT}"
    DATABASE = None

    @staticmethod
    def initalise():
        client = pymongo.MongoClient(Database.URI)
        Database.DATABASE = client["dbname"]

    @staticmethod
    @validate_arguments
    def add_user(user: UserFullSchema):
        x = None
        if Database.find_user(user) == None:
            x = Database.DATABASE["users"].insert_one(user.dict())
        return x

    @staticmethod
    @validate_arguments
    def find_user(user: UserFullSchema | UserLoginSchema) -> dict:
        x = Database.DATABASE["users"].find_one(user.dict())
        return x

    @staticmethod
    @validate_arguments
    def delete_user(user: UserFullSchema):
        x = Database.DATABASE["users"].delete_one(user.dict())
        return x