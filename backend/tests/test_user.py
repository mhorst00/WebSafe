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

import shutil
import unittest

import app.user as user
from app.model import UserNew, User
from app.db import Database
from app.files import Filehandler


class TestUser(unittest.TestCase):
    def setUp(self):
        Database.initalise()
        Database.clear_col()
        Filehandler.preCheck()
        self.u_new = UserNew(
            full_name="testuser", username="test@mail.com", password="testpassword"
        )
        self.u_change = UserNew(
            full_name="testuser",
            username="test@mail.com",
            password="someotherpass",
        )

    def tearDown(self):
        Database.clear_col()
        shutil.rmtree("safe/")

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
