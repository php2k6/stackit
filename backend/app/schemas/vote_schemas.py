from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

class VoteCreate(BaseModel):
    id: UUID  # Question ID or Answer ID
    is_answer: bool
    is_upvote: bool

class VoteUpdate(BaseModel):
    is_upvote: bool

class VoteResponse(BaseModel):
    vid: UUID
    userid: UUID
    username: str  # From user join
    is_answer: bool
    is_upvote: bool
    id: UUID  # Question ID or Answer ID
    
    class Config:
        from_attributes = True

class VoteToggle(BaseModel):
    is_upvote: bool

class VoteStats(BaseModel):
    item_id: UUID
    total_votes: int
    upvotes: int
    downvotes: int
    user_vote: Optional[bool] = None  # True=upvote, False=downvote, None=no vote

class VoteList(BaseModel):
    votes: list[VoteResponse]
    total: int
    page: int
    per_page: int