from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db import Database

Database.initalise()
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

@app.get("/", tags=["root"])
async def read_root() -> dict:
    return {"message": "Welcome to WebSafe!"}

@app.post("/login", tags=["auth"])
async def login() -> dict:
    pass

@app.get("/logout", tags=["auth"])
async def logout() -> dict:
    pass

@app.get("/safe", tags=["safe"])
async def get_safe() -> dict:
    pass

@app.post("/safe", tags=["safe"])
async def post_safe() -> dict:
    pass

@app.delete("/safe", tags=["safe"])
async def del_safe() -> dict:
    pass

@app.delete("/user", tags=["user"])
async def del_user() -> dict:
    pass

@app.post("/user", tags=["user"])
async def change_user(PostSchema) -> dict:
    pass