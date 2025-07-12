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
    
class Notification(Base):
    _tablename__ = "notification"
    
    nid = Column(UUID(as_uuid=True),primary_key=True,default=uuid.uuid4)
    userid = Column(UUID(as_uuid=True),ForeignKey("users.id",nullable=False))
    read = Column(Boolean,default=False)
    content = Column(Text, nullable=False)
    qid = Column(UUID(as_uuid=True),ForeignKey("question.qid"),nullable=True)
    aid = Column(UUID(as_uuid=True),ForeignKey("answers,aid"),nullable=True)
    cid = Column(UUID(as_uuid=True),ForeignKey("comments.cid"),nullable=True)

    user = relationship("Users",back_populates="notifications")
    question = relationship("Question")
    answer = relationship("Answer")
    comment = relationship("Comment")
    
class Question(Base):
    __tablename__ = "question"
    
    qid = Column(UUID(as_uuid=True),primary_key=True,default=uuid.uuid4)
    userid = Column(UUID(as_uuid=True),ForeignKey("users.id",nullable=False))
    title = Column(Text, nullable=False)
    desc = Column(Text, nullable=False)
    votes = Column(Integer, default=0)
    created_at = Column(DateTime,default=datetime.utcnow)

    user = relationship("Users",back_populates="questions")
    answer = relationship("Answer",back_populates="question",cascade="all, delete")
    comments = relationship("Comment",back_populates="question",cascade="all, delete")
    tags = relationship("Tag",secondary=ques_tag,back_populates="questions")
    
class Answer(Base):
    __tablename__ = "answers"

    aid = Column(UUID(as_uuid=True),primary_key=True,default=uuid.uuid4)
    userid = Column(UUID(as_uuid=True),ForeignKey("users.id",nullable=False))
    qid = Column(UUID(as_uuid=True),ForeignKey("question.id",nullable=False))
    content = Column(Text, nullable=False)
    votes = Column(Integer, default=0)
    created_at = Column(DateTime,default=datetime.utcnow)

    user = relationship("Users",back_populates="answers")
    question = relationship("Question",back_populates="answers")
    
class Comment(Base):
    __tablename__ = "comments"

    cid = Column(UUID(as_uuid=True),primary_key=True,default=uuid.uuid4)
    userid = Column(UUID(as_uuid=True),ForeignKey("users.id",nullable=False))
    qid = Column(UUID(as_uuid=True),ForeignKey("question.id",nullable=False))
    aid = Column(UUID(as_uuid=True),ForeignKey("answersuestion.id",nullable=False))
    message = Column(Text, nullable=False)
    tags = Column(String)
    created_at = Column(DateTime,default=datetime.utcnow)

    user = relationship("Users",back_populates="answers")
    question = relationship("Question",back_populates="answers")
    answer = relationship("Answer")
