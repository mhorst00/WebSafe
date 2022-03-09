import unittest

from app.db import Database

Database.initalise()

class TestDb(unittest.TestCase):
    def test_add_user(self):
        u = {
            "username":"testuser",
            "email":"test@mail.com",
            "password":"testpassword",
            "safe":"testuser"
        }
        x = Database.add_user(u)
        self.assertIsNotNone(x)
        self.assertIsNotNone(Database.find_user(u))
        Database.delete_user(u)

    def test_find_user(self):
        u = {
            "username":"testuser",
            "email":"test@mail.com",
            "password":"testpassword",
            "safe":"testuser"
        }
        Database.add_user(u)
        self.assertIsNotNone(Database.find_user(u))
        Database.delete_user(u)

if __name__ == '__main__':
    unittest.main()