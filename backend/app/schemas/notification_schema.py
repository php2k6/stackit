from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from enum import Enum

class NotificationType(int, Enum):
    ANSWER = 1
    COMMENT = 2
    MENTION = 3

class NotificationCreate(BaseModel):
    userid: UUID
    content: str
    type: NotificationType

class NotificationUpdate(BaseModel):
    is_read: bool

class NotificationResponse(BaseModel):
    nid: UUID
    userid: UUID
    username: str  # From user join
    is_read: bool
    content: str
    type: NotificationType
    created_at: datetime
    
    class Config:
        from_attributes = True

class NotificationMarkRead(BaseModel):
    is_read: bool = True

class NotificationList(BaseModel):
    notifications: List[NotificationResponse]
    total: int
    unread_count: int
    page: int
    per_page: int

class NotificationStats(BaseModel):
    total_notifications: int
    unread_notifications: int
    read_notifications: int