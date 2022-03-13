import unittest

from app.db import Database

Database.initalise()
Database.DATABASE["users"].drop()

class TestDb(unittest.TestCase):
    u = {
            "username":"testuser",
            "email":"test@mail.com",
            "hashed_password":"testpassword",
            "safe_id":"testuser",
            "created_on": "1970-01-01 00:00:00"
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

if __name__ == '__main__':
    unittest.main()