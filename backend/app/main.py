from fastapi import FastAPI, APIRouter
from app.database import engine, get_db
from sqlalchemy.orm import Session
import app.models
from app.routers import chatbot, auth, user, question, answer, vote, notifications, home, comment
from fastapi.middleware.cors import CORSMiddleware
import re
app = FastAPI()
#optional to create all tables
#models.Base.metadata.create_all(bind=engine)
#app.include_router(chatbot.router)
app.include_router(auth.router, prefix="/api")
app.include_router(user.router, prefix="/api")
app.include_router(question.router, prefix="/api")
app.include_router(answer.router, prefix="/api")
app.include_router(vote.router, prefix="/api")
app.include_router(notifications.router, prefix="/api")
app.include_router(home.router, prefix="/api")
app.include_router(comment.router, prefix="/api")

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=".*",     
    allow_credentials=True,    
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/api")
def root():
    return {"message" : "Hello World"}