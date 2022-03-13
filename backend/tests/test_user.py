import unittest

import app.user as user
from app.model import UserInDB, UserNew

class TestUser(unittest.TestCase):
    u_new = UserNew(
            full_name="testuser",
            username="test@mail.com",
            password="testpassword"
        )
    u_db = UserInDB(
            full_name="testuser",
            username="test@mail.com",
            hashed_password="testpassword",
            safe_id="testuser"
        )
    u_change = UserNew(
            full_name="testuser",
            username="test@mail.com",
            password="someotherpass"
        )
    
    def test_add_user(self):
        x = user.add_user(self.u_new)
        self.assertTrue(x)
        user.delete_user(self.u_db)
    
    def test_get_user(self):
        x = user.add_user(self.u_new)
        self.assertTrue(x)
        test = user.get_user("testuser")
        self.assertEqual(test, self.u_db)
        user.delete_user(self.u_db)

    def test_delete_user(self):
        x = user.add_user(self.u_new)
        self.assertTrue(x)
        test = user.delete_user(self.u_db)
        self.assertTrue(test)

    def test_edit_user(self):
        x = user.add_user(self.u_new)
        self.assertTrue(x)
        test = user.edit_user(self.u_change, self.u_db)
        self.assertTrue(test)
        check = user.get_user("testuser")
        self.assertEqual(check["username"], self.u_new["username"])
        user.delete_user(UserInDB(**check))
