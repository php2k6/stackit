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

