from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID
from datetime import datetime

class UserCreate(BaseModel):
    username: str
    password: str
    email: EmailStr
    type: Optional[bool] = False  # Default to regular user
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
    
    class Config:
        from_attributes = True  # For SQLAlchemy models compatibility

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    profile_path: Optional[str] = None
    type: Optional[bool] = None