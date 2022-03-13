import glob
import os
import sys
from pydantic import validate_arguments
from decouple import config

FILE_BASE_DIR = config("FILE_BASE_DIR", default="safe/") #"safe/"
FILE_SIZE_LIMIT_KB = config("FILE_SIZE_LIMIT_KB", default = 50) #50 
#TODO: Replace prints with proper logging


class Filehandler():

    def preCheck():
        if os.path.exists(FILE_BASE_DIR) and os.path.isfile(FILE_BASE_DIR):
            print("Warning - File dir is not a directory")
            return False
        if not os.path.exists(FILE_BASE_DIR):
            print("Info - File dir is does not exist - creating dir")
            try:
                os.mkdir(FILE_BASE_DIR)
            except:
                print("Warning - Could not create directory: ", sys.exc_info()[0])
                return False
            return
        if os.path.exists(FILE_BASE_DIR) and os.path.isdir(FILE_BASE_DIR):
            print("Info - File dir exists") 
            return True

    @staticmethod
    @validate_arguments        
    def readFile(name: str, verify = False):
        x = glob.glob(FILE_BASE_DIR + name)
        if len(x) == 0:
            if not verify:
                print("Could not read Safe " + name + " - No such Safe")
            return None
        f = open(x[0],"r")
        content = f.read()
        f.close()
        return content
   
    @staticmethod
    @validate_arguments      
    def writeFile(name: str, payload : str):
        if sys.getsizeof(payload) / 1024 < FILE_SIZE_LIMIT_KB:
            with open(FILE_BASE_DIR + name, "w") as f:
              f.write(payload)
              return True
        else:
            print("Warning - Payload is larger than size limit, will not be saved")
            return False
            
    @staticmethod
    @validate_arguments           
    def deleteFile(name : str):
        if os.path.exists(FILE_BASE_DIR + name):
            os.remove(FILE_BASE_DIR + name)
            if Filehandler.readFile(name, True) == None:
                return True
            else:
                return False
        else:
            print("Could not delete Save " + name + " - No such Safe")
            return False
