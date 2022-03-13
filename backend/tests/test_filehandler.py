import unittest
import os
import shutil


from app.files import Filehandler
from decouple import config

FILE_BASE_DIR = config("FILE_BASE_DIR", default="safe/")

def testBuilder():
    Filehandler.preCheck()

def testTeardown():
    shutil.rmtree(FILE_BASE_DIR)

class TestFilehandler(unittest.TestCase):
    testBuilder()
    def testAWriteFile(self):
        x = Filehandler.writeFile("66","I Hate Sand")
        self.assertTrue(x)
        self.assertTrue(os.path.isfile(FILE_BASE_DIR + "66"))

    def testBReadFile(self):
        x = Filehandler.readFile("66")
        self.assertIsNotNone(x)
        self.assertEqual(x, "I Hate Sand")   

    def testCDeleteFile(self):
        x = Filehandler.deleteFile("66")
        self.assertTrue(x)
        self.assertFalse(os.path.exists(FILE_BASE_DIR + "66"))
        x = Filehandler.deleteFile("sollteNichtExistieren")
        self.assertFalse(x)

        testTeardown()
    