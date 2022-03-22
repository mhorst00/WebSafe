import unittest
import os
import shutil

from app.files import Filehandler

FILE_BASE_DIR = "safe/"


class TestFilehandler(unittest.TestCase):
    def setUp(self):
        Filehandler.preCheck()

    def tearDown(self):
        shutil.rmtree(FILE_BASE_DIR)

    def testAWriteFile(self):
        x = Filehandler.writeFile("66", "I Hate Sand")
        self.assertTrue(x)
        self.assertTrue(os.path.isfile(FILE_BASE_DIR + "66"))

    def testBReadFile(self):
        x = Filehandler.writeFile("66", "I Hate Sand")
        self.assertTrue(x)
        x = Filehandler.readFile("66")
        self.assertIsNotNone(x)
        self.assertEqual(x, "I Hate Sand")

    def testCDeleteFile(self):
        x = Filehandler.writeFile("66", "I Hate Sand")
        self.assertTrue(x)
        x = Filehandler.deleteFile("66")
        self.assertTrue(x)
        self.assertFalse(os.path.exists(FILE_BASE_DIR + "66"))
        x = Filehandler.deleteFile("sollteNichtExistieren")
        self.assertFalse(x)
