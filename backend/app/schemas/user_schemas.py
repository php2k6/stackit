from pydantic import BaseModel, EmailStr
from typing import Optional, List
from uuid import UUID
from datetime import datetime

class UserCreate(BaseModel):
    username: str
    password: str
    email: EmailStr
    type: Optional[bool] = False
    googlelogin: Optional[bool] = False
    profile_path: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: UUID
    username: str
    email: EmailStr
    type: bool
    googlelogin: bool
    created_at: datetime
    profile_path: Optional[str] = None
    
    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    profile_path: Optional[str] = None
    type: Optional[bool] = None

# New schema for /me endpoint response
class UserProfileResponse(BaseModel):
    username: str
    profile_path: Optional[str]
    joined_since: datetime
    type: bool
    questions: List[List[str]]  # [[qid, title], ...]
    answers: List[List[str]]    # [[aid, title], ...]
    comments: List[List[str]]   # [[cid, title], ...]
    upvotes: List[List[str]]    # [[vid, id, is_answer], ...]

# New schema for public user profile
class UserPublicResponse(BaseModel):
    username: str
    profile_path: Optional[str]
    joined_since: datetime
    type: bool
    questions: List[List[str]]  # [[qid, title], ...]

# New schema for admin users list
class UserListItem(BaseModel):
    id: str
    username: str
    email: str
    type: bool
    joined_since: datetime
    googlelogin: bool

class UsersListResponse(BaseModel):
    users: List[UserListItem]
    total: int