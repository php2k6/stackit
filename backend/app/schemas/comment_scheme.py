from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

class CommentCreate(BaseModel):
    aid: UUID
    username: str
    message: str

class CommentUpdate(BaseModel):
    message: Optional[str] = None

class CommentResponse(BaseModel):
    cid: UUID
    userid: UUID
    username: str  # From user join
    message: str
    aid: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True

class CommentList(BaseModel):
    comments: list[CommentResponse]
    total: int
    page: int
    per_page: int

class AnswerComments(BaseModel):
    answer_id: UUID
    comments: list[CommentResponse]
    total_comments: int