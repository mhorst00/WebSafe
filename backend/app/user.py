import random
import string
import hashlib
from pydantic import validate_arguments

from app.model import SafePayload, User, UserInDB, UserInDBDel, UserNew
from app.db import Database
from app.auth import get_password_hash
from app.files import Filehandler


@validate_arguments
def add_user(user: UserNew):
    """Adds user to DB. Returns True on success, False if user already exists,
    None if user could not be added"""
    query = User(username=user.username.lower())
    if Database.find_user(query):
        return False
    hashed_password = get_password_hash(user.password)
    safe_id = hashlib.sha1(user.username.lower().encode()).hexdigest()
    user_dict = UserInDB(
        username=user.username.lower(),
        full_name=user.full_name,
        hashed_password=hashed_password,
        safe_id=safe_id,
    )
    Database.add_user(user_dict)
    empty_safe = SafePayload(
        safe_payload="", enc_data_key="", enc_vault_key="", data_iv="", vault_iv=""
    )
    Filehandler.writeFile(safe_id, empty_safe)
    if Database.find_user(user_dict) and Filehandler.checkFile(safe_id):
        return True


@validate_arguments
def get_user(user: User):
    return Database.find_user(user)


@validate_arguments
def delete_user(user: UserInDB):
    """Deletes user from DB. Returns True on success."""
    x = Database.delete_user(user)
    if x:
        y = Filehandler.deleteFile(user.safe_id)
        if y:
            return True
        return False


@validate_arguments
def edit_user(data: UserNew, user: UserInDB):
    """Saves received data in given user in DB"""
    hashed_password = get_password_hash(data.password)
    """Search for existing user with email in db"""
    checkusername = Database.find_by_value("username", data.username)
    if checkusername is None:
        """If user does not exist, edit data"""
        d = Database.delete_user(user)
        if not d:
            return False
        user_dict = UserInDB(
            username=data.username.lower(),
            full_name=data.full_name,
            hashed_password=hashed_password,
            safe_id=user.safe_id,
        )
        Database.add_user(user_dict)
        if Database.find_user(user_dict):
            return True
    elif user.safe_id == checkusername.safe_id:
        """If user exists, only edit if id of user is identical"""
        d = Database.delete_user(user)
        if not d:
            return False
        user_dict = UserInDB(
            username=data.username.lower(),
            full_name=data.full_name,
            hashed_password=hashed_password,
            safe_id=user.safe_id,
        )
        Database.add_user(user_dict)
        if Database.find_user(user_dict):
            return True
    else:
        return False


@validate_arguments
def add_deletion_string(user: UserInDB):
    """Adds verification string to user in DB. Returns string on success."""
    del_string = "".join(
        random.SystemRandom().choice(string.ascii_uppercase + string.digits)
        for _ in range(32)
    )
    user_dict = UserInDBDel(
        username=user.username,
        full_name=user.full_name,
        hashed_password=user.hashed_password,
        safe_id=user.safe_id,
        del_string=del_string,
    )
    Database.delete_user(user)
    x = Database.add_user(user_dict)
    if x:
        return del_string


@validate_arguments
def find_deletion_string(del_string: str) -> UserInDBDel | None:
    """Searches DB for user with given deletion string"""
    if len(del_string) != 32:
        return None
    user = Database.find_by_value("del_string", del_string)
    if user.del_string:
        return user
