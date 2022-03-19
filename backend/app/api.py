from datetime import timedelta

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm

from app.model import Message, UserInDB, Token, UserNew, SafePayloadNew
from app.db import Database
import app.auth as auth
import app.user as user
from app.files import Filehandler

Database.initalise()
Filehandler.preCheck()
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
        return {"message": "User has been deleted"}
    if not x:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User could not be found",
            headers={"WWW-Authenticate": "Bearer"},
        )

@app.post("/user/change", tags=["user"])
async def change_user(change_user: UserNew, current_user: UserInDB = Depends(auth.get_current_user)):
    x = user.edit_user(change_user, current_user)
    if x: return {"message": "Successfully edited user."}
    if not x: raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Edited user could not be saved",
            headers={"WWW-Authenticate": "Bearer"},
        )

@app.post("/user/new", response_model=Message, tags=["user"])
async def new_user(new_user: UserNew):
    x = user.add_user(new_user)
    if x is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="New user could not be saved",
            headers={"WWW-Authenticate": "Bearer"},
        )
    elif x:
        return {"message": "User has been created"}
    elif x is False:
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
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not delete Safe",
            headers={"WWW-Authenticate": "Bearer"},
        )  
