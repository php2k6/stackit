from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

class AnswerCreate(BaseModel):
    qid: UUID
    content: str
    image_path: Optional[str] = None

class AnswerUpdate(BaseModel):
    content: Optional[str] = None
    accepted: Optional[bool] = None
    image_path: Optional[str] = None

class AnswerResponse(BaseModel):
    aid: UUID
    qid: UUID
    userid: UUID
    username: str  # From user join
    content: str
    accepted: bool
    votes: int
    created_at: datetime
    image_path: Optional[str] = None
    
    class Config:
        from_attributes = True

class AnswerAccept(BaseModel):
    accepted: bool

class AnswerVote(BaseModel):
    vote_type: str  # "up" or "down"

class AnswerList(BaseModel):
    answers: list[AnswerResponse]
    total: int
    page: int
    per_page: int

class QuestionAnswers(BaseModel):
    question_id: UUID
    answers: list[AnswerResponse]
    total_answers: int