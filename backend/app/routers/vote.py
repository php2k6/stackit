from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from app.auth import get_current_user
from app.models import Users, Question, Answer, Votes
from app.database import get_db
from app.schemas.vote_schemas import VoteCreate, VoteResponse, VoteStats
from uuid import UUID
from typing import Optional

router = APIRouter(
    prefix="/vote",
    tags=["Votes"],
    responses={404: {"description": "Not found"}}
)

@router.post("/answer/{aid}", status_code=200)
def vote_answer(
    aid: UUID,
    vote_data: VoteCreate,
    current_user: Users = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Vote on an answer (upvote or downvote)."""
    
    # Check if answer exists
    answer = db.query(Answer).filter(Answer.aid == aid).first()
    if not answer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Answer not found"
        )
    
    # Check if user is trying to vote on their own answer
    if answer.userid == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot vote on your own answer"
        )
    
    # Check if user has already voted on this answer
    existing_vote = db.query(Votes).filter(
        Votes.userid == current_user.id,
        Votes.id == aid,
        Votes.is_answer == True
    ).first()
    
    if existing_vote:
        # Update existing vote if it's different
        if existing_vote.is_upvote != vote_data.is_upvote:
            # Change vote direction - update vote count accordingly
            if vote_data.is_upvote:
                answer.votes += 2  # Remove downvote (-1) and add upvote (+1) = +2
            else:
                answer.votes -= 2  # Remove upvote (+1) and add downvote (-1) = -2
            
            existing_vote.is_upvote = vote_data.is_upvote
        else:
            # Same vote - do nothing or return message
            return {"message": "Vote already exists", "current_vote": existing_vote.is_upvote}
    else:
        # Create new vote
        new_vote = Votes(
            userid=current_user.id,
            is_answer=True,
            is_upvote=vote_data.is_upvote,
            id=aid
        )
        
        # Update answer vote count
        if vote_data.is_upvote:
            answer.votes += 1
        else:
            answer.votes -= 1
        
        db.add(new_vote)
    
    db.commit()
    db.refresh(answer)
    
    return {
        "message": "Vote recorded successfully",
        "answer_id": aid,
        "vote_type": "upvote" if vote_data.is_upvote else "downvote",
        "total_votes": answer.votes
    }

@router.post("/question/{qid}", status_code=200)
def vote_question(
    qid: UUID,
    vote_data: VoteCreate,
    current_user: Users = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Vote on a question (upvote or downvote)."""
    
    # Check if question exists
    question = db.query(Question).filter(Question.qid == qid).first()
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    
    # Check if user is trying to vote on their own question
    if question.userid == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot vote on your own question"
        )
    
    # Check if user has already voted on this question
    existing_vote = db.query(Votes).filter(
        Votes.userid == current_user.id,
        Votes.id == qid,
        Votes.is_answer == False
    ).first()
    
    if existing_vote:
        # Update existing vote if it's different
        if existing_vote.is_upvote != vote_data.is_upvote:
            # Change vote direction - update vote count accordingly
            if vote_data.is_upvote:
                question.votes += 2  # Remove downvote (-1) and add upvote (+1) = +2
            else:
                question.votes -= 2  # Remove upvote (+1) and add downvote (-1) = -2
            
            existing_vote.is_upvote = vote_data.is_upvote
        else:
            # Same vote - do nothing or return message
            return {"message": "Vote already exists", "current_vote": existing_vote.is_upvote}
    else:
        # Create new vote
        new_vote = Votes(
            userid=current_user.id,
            is_answer=False,
            is_upvote=vote_data.is_upvote,
            id=qid
        )
        
        # Update question vote count
        if vote_data.is_upvote:
            question.votes += 1
        else:
            question.votes -= 1
        
        db.add(new_vote)
    
    db.commit()
    db.refresh(question)
    
    return {
        "message": "Vote recorded successfully",
        "question_id": qid,
        "vote_type": "upvote" if vote_data.is_upvote else "downvote",
        "total_votes": question.votes
    }

@router.delete("/answer/{aid}", status_code=204)
def delete_vote_answer(
    aid: UUID,
    current_user: Users = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove vote from an answer."""
    
    # Check if answer exists
    answer = db.query(Answer).filter(Answer.aid == aid).first()
    if not answer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Answer not found"
        )
    
    # Find user's vote on this answer
    vote = db.query(Votes).filter(
        Votes.userid == current_user.id,
        Votes.id == aid,
        Votes.is_answer == True
    ).first()
    
    if not vote:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vote not found"
        )
    
    # Check if user owns the vote
    if vote.userid != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this vote"
        )
    
    # Update answer vote count
    if vote.is_upvote:
        answer.votes -= 1
    else:
        answer.votes += 1
    
    # Delete the vote
    db.delete(vote)
    db.commit()
    
    return None  # 204 No Content

@router.delete("/question/{qid}", status_code=204)
def delete_vote_question(
    qid: UUID,
    current_user: Users = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove vote from a question."""
    
    # Check if question exists
    question = db.query(Question).filter(Question.qid == qid).first()
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    
    # Find user's vote on this question
    vote = db.query(Votes).filter(
        Votes.userid == current_user.id,
        Votes.id == qid,
        Votes.is_answer == False
    ).first()
    
    if not vote:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vote not found"
        )
    
    # Check if user owns the vote
    if vote.userid != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this vote"
        )
    
    # Update question vote count
    if vote.is_upvote:
        question.votes -= 1
    else:
        question.votes += 1
    
    # Delete the vote
    db.delete(vote)
    db.commit()
    
    return None  # 204 No Content

@router.get("/answer/{aid}/stats")
def get_answer_vote_stats(
    aid: UUID,
    current_user: Optional[Users] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get vote statistics for an answer."""
    
    # Check if answer exists
    answer = db.query(Answer).filter(Answer.aid == aid).first()
    if not answer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Answer not found"
        )
    
    # Get vote counts
    upvotes = db.query(Votes).filter(
        Votes.id == aid,
        Votes.is_answer == True,
        Votes.is_upvote == True
    ).count()
    
    downvotes = db.query(Votes).filter(
        Votes.id == aid,
        Votes.is_answer == True,
        Votes.is_upvote == False
    ).count()
    
    # Get current user's vote if authenticated
    user_vote = None
    if current_user:
        vote = db.query(Votes).filter(
            Votes.userid == current_user.id,
            Votes.id == aid,
            Votes.is_answer == True
        ).first()
        if vote:
            user_vote = vote.is_upvote
    
    return {
        "answer_id": aid,
        "total_votes": answer.votes,
        "upvotes": upvotes,
        "downvotes": downvotes,
        "user_vote": user_vote
    }

@router.get("/question/{qid}/stats")
def get_question_vote_stats(
    qid: UUID,
    current_user: Optional[Users] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get vote statistics for a question."""
    
    # Check if question exists
    question = db.query(Question).filter(Question.qid == qid).first()
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    
    # Get vote counts
    upvotes = db.query(Votes).filter(
        Votes.id == qid,
        Votes.is_answer == False,
        Votes.is_upvote == True
    ).count()
    
    downvotes = db.query(Votes).filter(
        Votes.id == qid,
        Votes.is_answer == False,
        Votes.is_upvote == False
    ).count()
    
    # Get current user's vote if authenticated
    user_vote = None
    if current_user:
        vote = db.query(Votes).filter(
            Votes.userid == current_user.id,
            Votes.id == qid,
            Votes.is_answer == False
        ).first()
        if vote:
            user_vote = vote.is_upvote
    
    return {
        "question_id": qid,
        "total_votes": question.votes,
        "upvotes": upvotes,
        "downvotes": downvotes,
        "user_vote": user_vote
    }