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

import json
import logging
import os
import sys
import errno

from pydantic import validate_arguments
from decouple import config

from app.model import SafePayload

FILE_BASE_DIR = config("FILE_BASE_DIR", default="safe/")
FILE_SIZE_LIMIT_KB = config("FILE_SIZE_LIMIT_KB", default=50)


class Filehandler:
    def preCheck():
        if os.path.exists(FILE_BASE_DIR) and os.path.isfile(FILE_BASE_DIR):
            logging.exception("File dir is not a directory")
        if not os.path.exists(FILE_BASE_DIR):
            logging.info("File dir is does not exist - creating dir")
            try:
                os.mkdir(FILE_BASE_DIR)
            except OSError as e:
                if e.errno != errno.EEXIST:
                    logging.exception(f"Could not create directory: {e}")
        if os.path.exists(FILE_BASE_DIR) and os.path.isdir(FILE_BASE_DIR):
            logging.info("File dir exists")

    @staticmethod
    @validate_arguments
    def readFile(name: str, verify=False):
        try:
            with open(FILE_BASE_DIR + name, "r") as f:
                content = json.load(f)
                f.close()
                return content
        except OSError as e:
            logging.error(f"Could not read safe with error {e}")

    @staticmethod
    @validate_arguments
    def checkFile(name: str):
        try:
            if os.path.exists(FILE_BASE_DIR + name):
                return True
        except OSError as e:
            logging.error(f"Could not read safe with error {e}")

    @staticmethod
    @validate_arguments
    def writeFile(name: str, payload: SafePayload):
        if sys.getsizeof(payload) / 1024 < FILE_SIZE_LIMIT_KB:
            with open(FILE_BASE_DIR + name, "w") as f:
                f.write(payload.json())
                f.close()
                return True
        else:
            logging.error("Payload is larger than size limit, will not be saved")
            return False

    @staticmethod
    @validate_arguments
    def deleteFile(name: str):
        if os.path.exists(FILE_BASE_DIR + name):
            os.remove(FILE_BASE_DIR + name)
            if Filehandler.readFile(name, True) is None:
                return True
            else:
                return False
        else:
            logging.error("Could not delete safe " + name + " - No such safe")
            return False
