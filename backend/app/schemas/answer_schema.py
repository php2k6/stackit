from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime

class AnswerCreate(BaseModel):
    qid: UUID = Field(..., description="Question ID")
    content: str = Field(..., min_length=1, max_length=5000, description="Answer content")
    image_path: Optional[str] = Field(None, max_length=500, description="Image file path")

class AnswerUpdate(BaseModel):
    content: Optional[str] = Field(None, min_length=1, max_length=5000)
    image_path: Optional[str] = Field(None, max_length=500)

class AnswerResponse(BaseModel):
    aid: UUID
    qid: UUID
    userid: UUID
    username: str
    content: str
    accepted: bool
    votes: int
    created_at: datetime
    image_path: Optional[str] = None
    
    class Config:
        from_attributes = True

class AnswerCreateResponse(BaseModel):
    aid: UUID

class AnswerAccept(BaseModel):
    accepted: bool = True

class AnswerList(BaseModel):
    answers: list[AnswerResponse]
    total: int
    page: int
    per_page: int

class QuestionAnswers(BaseModel):
    question_id: UUID
    answers: list[AnswerResponse]
    total_answers: int