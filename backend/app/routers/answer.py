from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from app.auth import get_current_user
from app.models import Users, Question, Answer
from app.database import get_db
from app.schemas.answer_schema import (
    AnswerCreate,
    AnswerCreateResponse,
    AnswerResponse,
    AnswerAccept
)
from app.services.notification_service import NotificationService
from uuid import UUID

router = APIRouter(
    prefix="/answer",
    tags=["Answers"],
    responses={404: {"description": "Not found"}}
)

@router.post("/", status_code=201, response_model=AnswerCreateResponse)
def create_answer(
    answer: AnswerCreate,
    current_user: Users = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new answer for a question."""
    
    # Check if question exists
    question = db.query(Question).filter(Question.qid == answer.qid).first()
    if not question:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question not found"
        )
    
    # Check if question is closed
    if question.is_closed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot answer a closed question"
        )
    
    # Create new answer
    new_answer = Answer(
        qid=answer.qid,
        userid=current_user.id,
        username=current_user.username,
        content=answer.content,
        image_path=answer.image_path,
        accepted=False,
        votes=0
    )
    
    db.add(new_answer)
    db.commit()
    db.refresh(new_answer)
    
    # Send notification to question author (if not self-answering)
    if question.userid != current_user.id:
        notification_service = NotificationService(db)
        notification_service.notify_question_answered(
            question_id=answer.qid,
            answerer_username=current_user.username
        )
    
    return AnswerCreateResponse(aid=new_answer.aid)

@router.delete("/{aid}", status_code=204)
def delete_answer(
    aid: UUID,
    current_user: Users = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete an answer. Can only be done by the answer author or admin."""
    
    # Get the answer
    answer = db.query(Answer).filter(Answer.aid == aid).first()
    
    if not answer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Answer not found"
        )
    
    # Check if user can delete (owner or admin)
    if answer.userid != current_user.id and not current_user.type:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this answer"
        )
    
    # Delete the answer (cascade will delete related comments)
    db.delete(answer)
    db.commit()
    
    return None  # 204 No Content

@router.get("/{aid}", response_model=AnswerResponse)
def get_answer(aid: UUID, db: Session = Depends(get_db)):
    """Get a specific answer by ID."""
    
    # Get the answer
    answer = db.query(Answer).filter(Answer.aid == aid).first()
    
    if not answer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Answer not found"
        )
    
    return AnswerResponse(
        aid=answer.aid,
        qid=answer.qid,
        userid=answer.userid,
        username=answer.username,
        content=answer.content,
        accepted=answer.accepted,
        votes=answer.votes,
        created_at=answer.created_at,
        image_path=answer.image_path
    )

@router.post("/{aid}/accept", status_code=200)
def accept_answer(
    aid: UUID,
    current_user: Users = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Accept an answer. Only the question author can accept answers."""
    
    # Get the answer
    answer = db.query(Answer).filter(Answer.aid == aid).first()
    
    if not answer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Answer not found"
        )
    
    # Get the question to check ownership
    question = db.query(Question).filter(Question.qid == answer.qid).first()
    
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    
    # Check if current user is the question author
    if question.userid != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the question author can accept answers"
        )
    
    # Unaccept all other answers for this question first
    db.query(Answer).filter(
        Answer.qid == answer.qid,
        Answer.aid != aid
    ).update({"accepted": False})
    
    # Accept this answer
    answer.accepted = True
    db.commit()
    db.refresh(answer)
    
    return {"message": "Answer accepted successfully", "aid": answer.aid}

@router.post("/{aid}/unaccept", status_code=200)
def unaccept_answer(
    aid: UUID,
    current_user: Users = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Unaccept an answer. Only the question author can unaccept answers."""
    
    # Get the answer
    answer = db.query(Answer).filter(Answer.aid == aid).first()
    
    if not answer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Answer not found"
        )
    
    # Get the question to check ownership
    question = db.query(Question).filter(Question.qid == answer.qid).first()
    
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    
    # Check if current user is the question author
    if question.userid != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the question author can unaccept answers"
        )
    
    # Unaccept the answer
    answer.accepted = False
    db.commit()
    db.refresh(answer)
    
    return {"message": "Answer unaccepted successfully", "aid": answer.aid}

@router.get("/question/{qid}")
def get_answers_by_question(
    qid: UUID,
    db: Session = Depends(get_db),
    page: int = 1,
    per_page: int = 10
):
    """Get all answers for a specific question."""
    
    # Check if question exists
    question = db.query(Question).filter(Question.qid == qid).first()
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    
    # Calculate offset for pagination
    offset = (page - 1) * per_page
    
    # Get answers for the question (accepted first, then by votes, then by date)
    answers = db.query(Answer).filter(Answer.qid == qid).order_by(
        Answer.accepted.desc(),  # Accepted answers first
        Answer.votes.desc(),     # Then by votes
        Answer.created_at.asc()  # Then by creation time
    ).offset(offset).limit(per_page).all()
    
    # Get total count
    total = db.query(Answer).filter(Answer.qid == qid).count()
    
    return {
        "question_id": qid,
        "answers": [
            AnswerResponse(
                aid=a.aid,
                qid=a.qid,
                userid=a.userid,
                username=a.username,
                content=a.content,
                accepted=a.accepted,
                votes=a.votes,
                created_at=a.created_at,
                image_path=a.image_path
            )
            for a in answers
        ],
        "total_answers": total,
        "page": page,
        "per_page": per_page
    }