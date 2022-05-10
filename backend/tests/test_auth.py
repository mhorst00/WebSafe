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

from datetime import timedelta
import shutil
import unittest

import app.auth as auth
import app.user as user
from app.model import User, UserNew
from app.db import Database
from app.files import Filehandler


class TestAuth(unittest.TestCase):
    def setUp(self):
        self.test_user = UserNew(
            username="test@mail.com", full_name="testuser", password="password"
        )
        Database.initalise()
        Database.clear_col()
        Filehandler.preCheck()

    def tearDown(self):
        Database.clear_col()
        shutil.rmtree("safe/")

    def test_password_hash(self):
        test_pw = "simplepassword"
        test_hash = auth.get_password_hash(test_pw)
        self.assertIsInstance(test_hash, str)
        test_bool = auth.verify_password(test_pw, test_hash)
        self.assertTrue(test_bool)

    def test_get_user(self):
        x = user.add_user(self.test_user)
        self.assertTrue(x)
        test_user = auth.get_user(self.test_user.username)
        self.assertIsNotNone(test_user)
        user.delete_user(user.get_user(User(username="test@mail.com")))

    def test_authenticate_user(self):
        x = user.add_user(self.test_user)
        self.assertTrue(x)
        test_auth = auth.authenticate_user("test@mail.com", "password")
        self.assertIsNot(test_auth, False)
        user.delete_user(user.get_user(User(username="test@mail.com")))

    def test_create_access_token(self):
        access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = auth.create_access_token(
            data={"sub": self.test_user.username}, expires_delta=access_token_expires
        )
        self.assertIsInstance(access_token, str)

    def test_get_current_user(self):
        x = user.add_user(self.test_user)
        self.assertTrue(x)
        access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = auth.create_access_token(
            data={"sub": self.test_user.username}, expires_delta=access_token_expires
        )
        test_user = auth.get_current_user(access_token)
        self.assertIsNotNone(test_user)
        user.delete_user(user.get_user(User(username="test@mail.com")))
