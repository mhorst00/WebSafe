import glob
import os
import sys

from fastapi import HTTPException, status
from pydantic import validate_arguments
from decouple import config

FILE_BASE_DIR = config("FILE_BASE_DIR", default="safe/")  # "safe/"
FILE_SIZE_LIMIT_KB = config("FILE_SIZE_LIMIT_KB", default=50)  # 50
# TODO: Replace prints with proper logging


class Filehandler():

    def preCheck():
        if os.path.exists(FILE_BASE_DIR) and os.path.isfile(FILE_BASE_DIR):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Warning - File dir is not a directory",
                headers={"WWW-Authenticate": "Bearer"},
            )
        if not os.path.exists(FILE_BASE_DIR):
            print("Info - File dir is does not exist - creating dir")
            try:
                os.mkdir(FILE_BASE_DIR)
            except:
                m = "Warning - Could not create directory: " + sys.exc_info()[0]
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=m,
                    headers={"WWW-Authenticate": "Bearer"},
                )
        if os.path.exists(FILE_BASE_DIR) and os.path.isdir(FILE_BASE_DIR):
            print("Info - File dir exists")

    @staticmethod
    @validate_arguments
    def readFile(name: str, verify=False):
        try:
            with open(FILE_BASE_DIR + name, "r") as f:
                content = f.read()
                f.close()
                return content
        except:
            print("Warning - Could not read Safe: " + str(sys.exc_info()[0]))

    @staticmethod
    @validate_arguments
    def writeFile(name: str, payload: str):
        if sys.getsizeof(payload) / 1024 < FILE_SIZE_LIMIT_KB:
            with open(FILE_BASE_DIR + name, "w") as f:
                f.write(payload)
                f.close()
                return True
        else:
            print("Warning - Payload is larger than size limit, will not be saved")
            return False

    @staticmethod
    @validate_arguments
    def deleteFile(name: str):
        if os.path.exists(FILE_BASE_DIR + name):
            os.remove(FILE_BASE_DIR + name)
            if Filehandler.readFile(name, True) == None:
                return True
            else:
                return False
        else:
            print("Could not delete Save " + name + " - No such Safe")
            return False
