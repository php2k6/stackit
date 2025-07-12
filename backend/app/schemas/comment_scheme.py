from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID
from datetime import datetime

class CommentCreate(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000, description="Comment message")

class CommentUpdate(BaseModel):
    message: Optional[str] = Field(None, min_length=1, max_length=1000)

class CommentResponse(BaseModel):
    cid: UUID
    userid: UUID
    username: str 
    message: str
    aid: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True

class CommentCreateResponse(BaseModel):
    cid: UUID
    created_at: datetime

class CommentList(BaseModel):
    comments: List[CommentResponse]
    total: int
    page: int
    per_page: int

class AnswerComments(BaseModel):
    answer_id: UUID
    comments: List[CommentResponse]
    total_comments: int