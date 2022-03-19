from datetime import timedelta
import logging

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm

from app.model import Message, User, UserInDB, Token, UserNew, SafePayloadNew
from app.db import Database
from app.mail import MailSend
import app.auth as auth
import app.user as user
from app.files import Filehandler

logging.basicConfig(filename="app.log", level=logging.INFO, format='%(asctime)s %(levelname)s:%(message)s', filemode="w")

Database.initalise()
Filehandler.preCheck()
MailSend.initialise()

app = FastAPI()

origins = [
    "http://localhost:3000",
    "localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/user/delete", response_model=Message, tags=["user"])
async def del_user(current_user: UserInDB = Depends(auth.get_current_user)):
    x = user.delete_user(current_user)
    if x:
        logging.info(f"Deleted user {current_user.username}")
        return {"message": "User has been deleted"}
    if not x:
        logging.error(f"Could not find user {current_user.username} for deletion")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User could not be found",
            headers={"WWW-Authenticate": "Bearer"},
        )

@app.get("/user/delete/verify/{del_string}", response_model=Message, tags=["user"])
async def del_user_verify(del_string: str):
    if len(del_string) != 32:
        logging.error("Received del_string in wrong format")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The verification ID is not in the right format or length",
            headers={"WWW-Authenticate": "Bearer"},
        )
    current_user = user.find_deletion_string(del_string)
    if del_string.__eq__(current_user.del_string):
        user_db = UserInDB(
            username=current_user.username,
            full_name=current_user.full_name,
            hashed_password=current_user.hashed_password,
            safe_id=current_user.safe_id
        )
        user.delete_user(user_db)
        logging.info(f"Deleted user {user_db.username}")
        return {"message": "User has been deleted"}
    else: 
        logging.info(f"Could not delete user {user_db.username}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="User could not be deleted",
            headers={"WWW-Authenticate": "Bearer"},
        )

@app.post("/user/delete/pass_forgotten", response_model=Message, tags=["user"])
async def del_user_no_pass(current_user: User):
    x = user.get_user(current_user)
    if x:
        MailSend.send_user_delete(x)
        logging.info(f"Sent deletion request email to user {current_user.username}")
        return {"message": "Mail for deletion has been sent"}
    else: 
        logging.error(f"Could not send deletion request mail to user {current_user.username}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="User could not be found or mail could not be sent",
        )

@app.post("/user/change", tags=["user"])
async def change_user(change_user: UserNew, current_user: UserInDB = Depends(auth.get_current_user)):
    x = user.edit_user(change_user, current_user)
    if x: 
        logging.info(f"Edited user {current_user.username}")
        return {"message": "Successfully edited user."}
    if not x: 
        logging.error(f"Error while editing user {current_user.username}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Edited user could not be saved",
            headers={"WWW-Authenticate": "Bearer"},
        )

@app.post("/user/new", response_model=Message, tags=["user"])
async def new_user(new_user: UserNew):
    x = user.add_user(new_user)
    if x is None:
        logging.error(f"Received new user but could not save it")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="New user could not be saved",
            headers={"WWW-Authenticate": "Bearer"},
        )
    elif x:
        user_db = user.get_user(User(username=new_user.username))
        MailSend.send_user_greeting(user_db)
        logging.info(f"Created new user {new_user.username}")
        return {"message": "User has been created"}
    elif x is False:
        logging.error(f"User creation for user {new_user.username} failed because of duplicate")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="This email address is already registered",
            headers={"WWW-Authenticate": "Bearer"},
        )

@app.get("/user/me", response_model=UserInDB, tags=["user"])
async def read_user_me(current_user: UserInDB = Depends(auth.get_current_user)):
    return current_user

@app.post("/token", response_model=Token, tags=["user"])
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = auth.authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/safe", tags=["safe"])
async def get_safe(current_user: UserInDB = Depends(auth.get_current_user)):
    x = Filehandler.readFile(current_user.safe_id)
    if x is None:
        logging.error(f"Error while reading safe {current_user.safe_id}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not read Safe",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return {"safePayload": x}

@app.post("/safe", tags=["safe"])
async def post_safe(safePayload : SafePayloadNew, current_user: UserInDB = Depends(auth.get_current_user)):
    x = Filehandler.writeFile(current_user.safe_id, safePayload.safePayload)
    if x:
        return {"message:", "Successfully updated Safe"}
    else:
        logging.error(f"Error while receiving safe {current_user.safe_id}. Size too big")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Payload is larger than size limit, will not be saved",
            headers={"WWW-Authenticate": "Bearer"},
        )  
        
@app.post("/safe/delete", tags=["safe"])
async def del_safe(current_user: UserInDB = Depends(auth.get_current_user)):
    x = Filehandler.deleteFile(current_user.safe_id)
    if x:
        return{"message:", "Successfully deleted Safe"}
    else:
        logging.error(f"Error while deleting safe {current_user.safe_id}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not delete Safe",
            headers={"WWW-Authenticate": "Bearer"},
        )  
