"""
This file is part of WebSafe and has been contributed by https://github.com/mhorst00.

WebSafe is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
"""

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
