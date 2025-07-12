from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime

class QuestionCreate(BaseModel):
    title: str
    desc: str
    tags: Optional[str] = None
    image_path: Optional[str] = None

class QuestionUpdate(BaseModel):
    title: Optional[str] = None
    desc: Optional[str] = None
    tags: Optional[str] = None
    is_closed: Optional[bool] = None
    image_path: Optional[str] = None

class QuestionResponse(BaseModel):
    qid: UUID
    username: str
    userid: UUID
    title: str
    desc: str
    votes: int
    tags: Optional[str] = None
    created_at: datetime
    is_closed: bool
    image_path: Optional[str] = None
    
    class Config:
        from_attributes = True

# New schema for answer response within question
class AnswerInQuestion(BaseModel):
    aid: UUID
    userid: UUID
    username: str
    content: str
    accepted: bool
    votes: int
    created_at: datetime
    image_path: Optional[str] = None
    
    class Config:
        from_attributes = True

# New schema for detailed question with answers
class QuestionDetailResponse(BaseModel):
    qid: UUID
    username: str
    userid: UUID
    title: str
    desc: str
    votes: int
    tags: Optional[str] = None
    created_at: datetime
    is_closed: bool
    image_path: Optional[str] = None
    answers: List[AnswerInQuestion]
    
    class Config:
        from_attributes = True

# Schema for question creation response
class QuestionCreateResponse(BaseModel):
    qid: UUID
    created_at: datetime

class QuestionList(BaseModel):
    questions: List[QuestionResponse]
    total: int
    page: int
    per_page: int