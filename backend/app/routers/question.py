from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from app.auth import get_current_user, get_admin_user
from app.models import Users, Question, Answer
from app.database import get_db
from app.schemas.question_schemas import (
    QuestionCreate, 
    QuestionUpdate, 
    QuestionResponse, 
    QuestionDetailResponse,
    QuestionCreateResponse,
    AnswerInQuestion
)
from uuid import UUID
from typing import List

router = APIRouter(
    prefix="/question",
    tags=["Questions"],
    responses={404: {"description": "Not found"}}
)

@router.get("/{qid}", response_model=QuestionDetailResponse)
def get_question(qid: UUID, db: Session = Depends(get_db)):
    """Get a specific question with all its answers."""
    
    # Get the question
    question = db.query(Question).filter(Question.qid == qid).first()
    
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    
    # Get all answers for this question
    answers = db.query(Answer).filter(Answer.qid == qid).all()
    
    # Convert answers to schema format
    answer_list = [
        AnswerInQuestion(
            aid=answer.aid,
            userid=answer.userid,
            username=answer.username,
            content=answer.content,
            accepted=answer.accepted,
            votes=answer.votes,
            created_at=answer.created_at,
            image_path=answer.image_path
        )
        for answer in answers
    ]
    
    # Return question with answers
    return QuestionDetailResponse(
        qid=question.qid,
        username=question.username,
        userid=question.userid,
        title=question.title,
        desc=question.desc,
        votes=question.votes,
        tags=question.tags,
        created_at=question.created_at,
        is_closed=question.is_closed,
        image_path=question.image_path,
        answers=answer_list
    )

@router.post("/", response_model=QuestionCreateResponse)
def create_question(
    question: QuestionCreate, 
    current_user: Users = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new question."""
    
    # Create new question
    new_question = Question(
        username=current_user.username,
        userid=current_user.id,
        title=question.title,
        desc=question.desc,
        tags=question.tags,
        image_path=question.image_path,
        votes=0,
        is_closed=False
    )
    
    db.add(new_question)
    db.commit()
    db.refresh(new_question)
    
    return QuestionCreateResponse(
        qid=new_question.qid,
        created_at=new_question.created_at
    )

@router.delete("/{qid}", status_code=204)
def delete_question(
    qid: UUID, 
    current_user: Users = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a question. Can only be done by the question author or admin."""
    
    # Get the question
    question = db.query(Question).filter(Question.qid == qid).first()
    
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    
    # Check if user can delete (owner or admin)
    if question.userid != current_user.id and not current_user.type:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this question"
        )
    
    # Delete the question (cascade will delete related answers and comments)
    db.delete(question)
    db.commit()
    
    return None  # 204 No Content

@router.get("/", response_model=List[QuestionResponse])
def get_questions(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 10,
    search: str = None,
    tags: str = None
):
    """Get all questions with optional search and filtering."""
    
    query = db.query(Question)
    
    # Apply search filter
    if search:
        query = query.filter(
            Question.title.ilike(f"%{search}%") | 
            Question.desc.ilike(f"%{search}%")
        )
    
    # Apply tags filter
    if tags:
        query = query.filter(Question.tags.ilike(f"%{tags}%"))
    
    # Order by created_at descending (newest first)
    questions = query.order_by(Question.created_at.desc()).offset(skip).limit(limit).all()
    
    return [
        QuestionResponse(
            qid=q.qid,
            username=q.username,
            userid=q.userid,
            title=q.title,
            desc=q.desc,
            votes=q.votes,
            tags=q.tags,
            created_at=q.created_at,
            is_closed=q.is_closed,
            image_path=q.image_path
        )
        for q in questions
    ]

@router.put("/{qid}", response_model=QuestionResponse)
def update_question(
    qid: UUID,
    question_update: QuestionUpdate,
    current_user: Users = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a question. Can only be done by the question author."""
    
    # Get the question
    question = db.query(Question).filter(Question.qid == qid).first()
    
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    
    # Check if user can update (owner only)
    if question.userid != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this question"
        )
    
    # Update question fields
    update_data = question_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(question, field, value)
    
    db.commit()
    db.refresh(question)
    
    return QuestionResponse(
        qid=question.qid,
        username=question.username,
        userid=question.userid,
        title=question.title,
        desc=question.desc,
        votes=question.votes,
        tags=question.tags,
        created_at=question.created_at,
        is_closed=question.is_closed,
        image_path=question.image_path
    )


