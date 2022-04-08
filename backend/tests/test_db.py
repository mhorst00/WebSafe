import unittest

from app.db import Database


class TestDb(unittest.TestCase):
    def setUp(self):
        Database.initalise()
        Database.clear_col()
        self.u_db = {
            "full_name": "testuser",
            "username": "test@mail.com",
            "hashed_password": "testpassword",
            "safe_id": "testuser",
        }
        self.u = {"username": "test@mail.com"}

    def tearDown(self):
        Database.clear_col()

    def test_add_user(self):
        x = Database.add_user(self.u_db)
        self.assertIsNotNone(x)
        self.assertIsNotNone(Database.find_user(self.u))
        Database.delete_user(self.u_db)

    def test_find_user(self):
        Database.add_user(self.u_db)
        self.assertIsNotNone(Database.find_user(self.u))
        Database.delete_user(self.u_db)

    def test_delete_user(self):
        Database.add_user(self.u_db)
        self.assertIsNotNone(Database.find_user(self.u))
        Database.delete_user(self.u_db)
        self.assertIsNone(Database.find_user(self.u))

    def test_clear_col(self):
        Database.add_user(self.u_db)
        self.assertIsNotNone(Database.find_user(self.u))
        Database.clear_col()
        self.assertIsNone(Database.find_user(self.u))


if __name__ == "__main__":
    unittest.main()
