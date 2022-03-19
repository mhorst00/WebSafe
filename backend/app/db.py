import pymongo
from decouple import config
from pydantic import validate_arguments

from app.model import User, UserInDB, UserInDBDel

DB_URL = config("DB_URL", default="localhost")
DB_PORT = config("DB_PORT", default=27017, cast=int)

class Database():
    URI = f"mongodb://{DB_URL}:{DB_PORT}"
    DATABASE = None

    @staticmethod
    def initalise():
        client = pymongo.MongoClient(Database.URI)
        if client.server_info() is None:
            raise Exception("Could not connect to MongoDB database. Are the provided variables correct?")
        Database.DATABASE = client["dbname"]

    @staticmethod
    @validate_arguments
    def add_user(user: UserInDB):
        x = None
        if Database.find_user(user) == None:
            x = Database.DATABASE["users"].insert_one(user.dict())
        return x

    @staticmethod
    @validate_arguments
    def find_user(user: User | UserInDB):
        x = Database.DATABASE["users"].find_one(user.dict())
        if x:
            if "del_string" in x:
                return UserInDBDel(**x)
            else: return UserInDB(**x)

    @staticmethod
    @validate_arguments
    def find_by_value(key: str, value: str):
        x = Database.DATABASE["users"].find_one({key:value})
        if x:
            if "del_string" in x:
                return UserInDBDel(**x)
            return UserInDB(**x)

    @staticmethod
    @validate_arguments
    def delete_user(user: UserInDB):
        x = Database.DATABASE["users"].delete_one(user.dict())
        return x

    @staticmethod
    def clear_col():
        x: bool = Database.DATABASE["users"].drop()
        return x