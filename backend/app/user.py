from app.model import User, UserInDB, UserNew
from app.db import Database
from app.auth import get_password_hash


def add_user(user: UserNew):
    """Adds user to DB. Returns True on success, False if user already exists,
     None if user could not be added"""
    query = User(username=user.username)
    if Database.find_user(query):
        return False
    hashed_password = get_password_hash(user.password)
    safe_id = user.username
    user_dict = UserInDB(username=user.username, full_name=user.full_name, hashed_password=hashed_password, safe_id=safe_id)
    Database.add_user(user_dict)
    if Database.find_user(user_dict) is not None:
        return True

def delete_user(user: UserInDB):
    """Deletes user from DB. Returns True on success, False if user is not found"""
    if not Database.find_user(user):
        return False
    x = Database.delete_user(user)
    if x:
        return True

def edit_user(data: UserNew, user: UserInDB):
    """Saves received data in given user in DB"""
    x = Database.find_user(user)
    if not x:
        return False # add logging for failures on if's
    d = Database.delete_user(user)
    if not d:
        return False
    hashed_password = get_password_hash(data.password)
    user_dict = UserInDB(username=data.username, full_name=data.full_name, hashed_password=hashed_password, safe_id=x.safe_id)
    Database.add_user(user_dict)
    if Database.find_user(user_dict) is not None:
        return True