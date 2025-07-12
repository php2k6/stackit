from fastapi import FastAPI
from app.database import engine, get_db
from sqlalchemy.orm import Session
import app.models
from app.routers import chatbot
from fastapi.middleware.cors import CORSMiddleware
import re
app = FastAPI()
#optional to create all tables
#models.Base.metadata.create_all(bind=engine)
#pp.include_router(chatbot.router)


app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=".*",     
    allow_credentials=True,    
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/")
def root():
    return {"message" : "Hello World"}