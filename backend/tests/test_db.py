import unittest

from app.db import Database

Database.initalise()
Database.clear_col()

class TestDb(unittest.TestCase):
    u = {
            "full_name":"testuser",
            "username":"test@mail.com",
            "hashed_password":"testpassword",
            "safe_id":"testuser",
        }

    def test_add_user(self):
        x = Database.add_user(self.u)
        self.assertIsNotNone(x)
        self.assertIsNotNone(Database.find_user(self.u))
        Database.delete_user(self.u)

    def test_find_user(self):
        Database.add_user(self.u)
        self.assertIsNotNone(Database.find_user(self.u))
        Database.delete_user(self.u)

    def test_delete_user(self):
        Database.add_user(self.u)
        self.assertIsNotNone(Database.find_user(self.u))
        Database.delete_user(self.u)
        self.assertIsNone(Database.find_user(self.u))

    def test_clear_col(self):
        Database.add_user(self.u)
        self.assertIsNotNone(Database.find_user(self.u))
        Database.clear_col()
        self.assertIsNone(Database.find_user(self.u))

    def test_delete_user(self):
        u = {
            "username":"testuser",
            "email":"test@mail.com",
            "password":"testpassword",
            "safe":"testuser"
        }
        Database.add_user(u)
        self.assertIsNotNone(Database.find_user(u))
        Database.delete_user(u)
        self.assertIsNone(Database.find_user(u))

if __name__ == '__main__':
    unittest.main()