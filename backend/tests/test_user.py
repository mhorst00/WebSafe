import unittest

import app.user as user
from app.model import UserInDB, UserNew, User
from app.db import Database

Database.initalise()
Database.clear_col()

class TestUser(unittest.TestCase):
    u_new = UserNew(
            full_name="testuser",
            username="test@mail.com",
            password="testpassword"
        )
    u_change = UserNew(
            full_name="testuser",
            username="test@mail.com",
            password="someotherpass"
        )
    
    def test_add_user(self):
        x = user.add_user(self.u_new)
        self.assertTrue(x)
        y = user.get_user(User(username="test@mail.com"))
        self.assertIsNotNone(y)
        x = user.delete_user(y)
        self.assertTrue(x)
    
    def test_get_user(self):
        x = user.add_user(self.u_new)
        self.assertTrue(x)
        test = user.get_user(User(username="test@mail.com"))
        self.assertIsNotNone(test)
        self.assertEqual(test.full_name, self.u_new.full_name)
        x = user.delete_user(test)
        self.assertTrue(x)

    def test_delete_user(self):
        x = user.add_user(self.u_new)
        self.assertTrue(x)
        y = user.get_user(User(username="test@mail.com"))
        self.assertIsNotNone(y)
        x = user.delete_user(y)
        self.assertTrue(x)

    def test_edit_user(self):
        x = user.add_user(self.u_new)
        self.assertTrue(x)
        y = user.get_user(User(username="test@mail.com"))
        self.assertIsNotNone(y)
        test = user.edit_user(self.u_change, y)
        self.assertTrue(test)
        check = user.get_user(User(username="test@mail.com"))
        self.assertEqual(check.username, self.u_new.username)
        user.delete_user(check)
