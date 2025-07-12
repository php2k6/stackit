from fastapi import APIRouter, HTTPException, Depends, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, and_
from datetime import datetime, timedelta
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
from typing import List, Optional

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
    page: int = Query(default=1, ge=1, description="Page number"),
    per_page: int = Query(default=10, ge=1, le=50, description="Items per page"),
    search: Optional[str] = Query(default=None, description="Search in title, description, or tags"),
    tags: Optional[str] = Query(default=None, description="Filter by tags"),
    sort: str = Query(default="latest", description="Sort by: trending, latest, most_popular"),
    username: Optional[str] = Query(default=None, description="Filter by username")
):
    """Get all questions with optional search, filtering, and sorting."""
    
    # Calculate offset for pagination
    offset = (page - 1) * per_page
    
    # Base query
    query = db.query(Question)
    
    # Apply search filter (search in title, description, and tags)
    if search:
        query = query.filter(
            Question.title.ilike(f"%{search}%") | 
            Question.desc.ilike(f"%{search}%") |
            Question.tags.ilike(f"%{search}%")
        )
    
    # Apply tags filter
    if tags:
        query = query.filter(Question.tags.ilike(f"%{tags}%"))
    
    # Apply username filter
    if username:
        query = query.filter(Question.username.ilike(f"%{username}%"))
    
    # Apply sorting based on sort parameter
    if sort == "trending":
        # Get current time minus 24 hours
        twenty_four_hours_ago = datetime.utcnow() - timedelta(hours=24)
        
        # First get questions from last 24 hours sorted by votes
        trending_questions = query.filter(
            Question.created_at >= twenty_four_hours_ago
        ).order_by(desc(Question.votes), desc(Question.created_at)).offset(offset).limit(per_page).all()
        
        # If we don't have enough trending questions, fill with latest
        if len(trending_questions) < per_page:
            remaining_limit = per_page - len(trending_questions)
            trending_qids = [q.qid for q in trending_questions]
            
            older_questions = query.filter(
                and_(
                    Question.created_at < twenty_four_hours_ago,
                    ~Question.qid.in_(trending_qids) if trending_qids else True
                )
            ).order_by(desc(Question.created_at)).limit(remaining_limit).all()
            
            questions = trending_questions + older_questions
        else:
            questions = trending_questions
            
    elif sort == "latest":
        questions = query.order_by(desc(Question.created_at)).offset(offset).limit(per_page).all()
        
    elif sort == "most_popular":
        questions = query.order_by(desc(Question.votes), desc(Question.created_at)).offset(offset).limit(per_page).all()
        
    else:
        raise HTTPException(status_code=400, detail="Invalid sort parameter. Use: trending, latest, or most_popular")
    
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


