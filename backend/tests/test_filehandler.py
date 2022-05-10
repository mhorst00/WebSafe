"""
This file is part of WebSafe and has been contributed by 
https://github.com/Blackcheckgamer.

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
import os
import shutil

from app.files import Filehandler

FILE_BASE_DIR = "safe/"


class TestFilehandler(unittest.TestCase):
    def setUp(self):
        Filehandler.preCheck()
        self.test_safe = {
            "safe_payload": "I hate sand",
            "enc_data_key": "testKey",
            "enc_vault_key": "testKey",
            "data_iv": "testIv",
            "vault_iv": "testIv",
        }

    def tearDown(self):
        shutil.rmtree(FILE_BASE_DIR)

    def testAWriteFile(self):
        x = Filehandler.writeFile("66", self.test_safe)
        self.assertTrue(x)
        self.assertTrue(os.path.isfile(FILE_BASE_DIR + "66"))

    def testBReadFile(self):
        x = Filehandler.writeFile("66", self.test_safe)
        self.assertTrue(x)
        x = Filehandler.readFile("66")
        self.assertIsNotNone(x)
        self.assertEqual(x, self.test_safe)

    def testCDeleteFile(self):
        x = Filehandler.writeFile("66", self.test_safe)
        self.assertTrue(x)
        x = Filehandler.deleteFile("66")
        self.assertTrue(x)
        self.assertFalse(os.path.exists(FILE_BASE_DIR + "66"))
        x = Filehandler.deleteFile("sollteNichtExistieren")
        self.assertFalse(x)
