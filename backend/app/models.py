from app.database import Base
from sqlalchemy import (Boolean,Column,String,DateTime,Integer,Enum,Table,Text,ForeignKey)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime

ques_tag = Table(
    "ques_tag",
    Base.metadata,
    Column("qid",UUID(as_uuid=True),ForeignKey("question.qid"),primary_key=True),
    Column("tag",String,primary_key=True)
)

class Users(Base):
    __tablename__ = "users"  
    
    id = Column(UUID(as_uuid=True),primary_key=True,default=uuid.uuid4)
    username = Column(String, nullable=False, unique=True)
    password = Column(String, nullable=True)
    email = Column(String , nullable=False,unique=True)
    type = Column(Boolean, default=False)  
    googlelogin = Column(Boolean,default=False)
    created_at = Column(DateTime,default=datetime.utcnow)
    profile_path = Column(String, nullable=True)
    
    questions = relationship("Question",back_populates="user")
    answers = relationship("Answer",back_populates="user")
    comments = relationship("Comment",back_populates="user")
    notifications = relationship("Notification",back_populates="user")
    votes = relationship("Votes",back_populates="user")
    
class Notification(Base):
    __tablename__ = "notifications"  
    
    nid = Column(UUID(as_uuid=True),primary_key=True,default=uuid.uuid4)
    userid = Column(UUID(as_uuid=True),ForeignKey("users.id"),nullable=False)
    is_read = Column(Boolean,default=False) 
    content = Column(Text, nullable=False)
    type = Column(Integer, nullable=False)  
    created_at = Column(DateTime,default=datetime.utcnow)

    user = relationship("Users",back_populates="notifications")
    
class Question(Base):
    __tablename__ = "question"
    
    qid = Column(UUID(as_uuid=True),primary_key=True,default=uuid.uuid4)
    username = Column(String, nullable=False)  
    userid = Column(UUID(as_uuid=True),ForeignKey("users.id"),nullable=False)
    title = Column(Text, nullable=False)
    desc = Column(Text, nullable=False) 
    votes = Column(Integer, default=0)
    tags = Column(Text, nullable=True)  
    created_at = Column(DateTime,default=datetime.utcnow)
    is_closed = Column(Boolean, default=False)  
    image_path = Column(Text, nullable=True)  

    user = relationship("Users",back_populates="questions")
    answers = relationship("Answer",back_populates="question",cascade="all, delete")
    
class Answer(Base):
    __tablename__ = "answers"

    aid = Column(UUID(as_uuid=True),primary_key=True,default=uuid.uuid4)
    qid = Column(UUID(as_uuid=True),ForeignKey("question.qid"),nullable=False)  
    userid = Column(UUID(as_uuid=True),ForeignKey("users.id"),nullable=False)
    username = Column(String, nullable=False) 
    content = Column(Text, nullable=False)  
    accepted = Column(Boolean, default=False)  
    votes = Column(Integer, default=0)  
    created_at = Column(DateTime,default=datetime.utcnow)
    image_path = Column(Text, nullable=True)  

    user = relationship("Users",back_populates="answers")
    question = relationship("Question",back_populates="answers")
    comments = relationship("Comment",back_populates="answer",cascade="all, delete")
    
class Comment(Base):
    __tablename__ = "comments"

    cid = Column(UUID(as_uuid=True),primary_key=True,default=uuid.uuid4)
    userid = Column(UUID(as_uuid=True),ForeignKey("users.id"),nullable=False) 
    message = Column(Text, nullable=False)  
    aid = Column(UUID(as_uuid=True),ForeignKey("answers.aid"),nullable=False)  
    created_at = Column(DateTime,default=datetime.utcnow)

    user = relationship("Users",back_populates="comments")
    answer = relationship("Answer",back_populates="comments")
    
class Votes(Base):
    __tablename__ = "votes"
    
    vid = Column(UUID(as_uuid=True),primary_key=True,default=uuid.uuid4)
    userid = Column(UUID(as_uuid=True),ForeignKey("users.id"),nullable=False)
    is_answer = Column(Boolean, nullable=False)
    is_upvote = Column(Boolean, nullable=False)
    id = Column(UUID(as_uuid=True),nullable=False)  # Question or Answer ID
    
    user = relationship("Users",back_populates="votes")

