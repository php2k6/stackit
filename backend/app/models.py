from app.database import Base
from sqlalchemy import (Boolean,Column,String,DateTime,Integer,Enum,Table,Text,ForeignKey)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import declarative_base,relationship
import uuid
from datetime import datetime

Base = declarative_base()

ques_tag = Table(
    "ques_tag",
    Base.metadata,
    Column("qid",UUID(as_uuid=True),ForeignKey("questions.qid"),primary_key=True),
    Column("tag",String,primary_key=True)
)


class Users(Base):
    __table__ = "users"
    id = Column(UUID(as_uuid=True),primary_key=True,default=uuid.uuid4)
    username = Column(String, nullable=False, unique=True)
    password = Column(String, nullable=True)
    email = Column(String , nullable=False,unique=True)
    admin = Column(Boolean, default=False) # If admin then true
    googlelogin = Column(Boolean,default=False)
    created_at = Column(DateTime,default=datetime.utcnow)
    
    questions = relationship("Question",back_populates="user")
    answers = relationship("Answer",back_populates="user")
    comments = relationship("Comment",back_populates="user")
    notifications = relationship("Notification",back_populates="user")
