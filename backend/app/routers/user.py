from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.auth import get_current_user, get_admin_user
from app.models import Users, Question, Answer, Comment, Votes
from app.database import get_db
from app.schemas.user_schemas import (
    UserResponse, 
    UserUpdate, 
    UserProfileResponse, 
    UserPublicResponse, 
    UsersListResponse,
    UserListItem
)
from typing import List, Dict, Any
from uuid import UUID

router = APIRouter(
    prefix="/user",
    tags=["Users"],
    responses={404: {"description": "Not found"}}
)

@router.get("/me", status_code=200, response_model=UserProfileResponse)
def get_me(current_user: Users = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get the current logged-in user with detailed profile including questions, answers, comments, and upvotes."""
    
    if not current_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get user's questions with qid and title
    questions = db.query(Question.qid, Question.title).filter(
        Question.userid == current_user.id
    ).all()
    
    # Get user's answers with aid and question title
    answers = db.query(Answer.aid, Question.title).join(
        Question, Answer.qid == Question.qid
    ).filter(Answer.userid == current_user.id).all()
    
    # Get user's comments with cid and question title (through answer)
    comments = db.query(Comment.cid, Question.title).join(
        Answer, Comment.aid == Answer.aid
    ).join(
        Question, Answer.qid == Question.qid
    ).filter(Comment.userid == current_user.id).all()
    
    # Get user's upvotes (both questions and answers) with qid/aid
    upvotes = db.query(Votes.vid, Votes.id, Votes.is_answer).filter(
        and_(Votes.userid == current_user.id, Votes.is_upvote == True)
    ).all()
    
    # Create response using schema
    return UserProfileResponse(
        username=current_user.username,
        profile_path=current_user.profile_path,
        joined_since=current_user.created_at,
        type=current_user.type,
        questions=[[str(q.qid), q.title] for q in questions],
        answers=[[str(a.aid), a.title] for a in answers],
        comments=[[str(c.cid), c.title] for c in comments],
        upvotes=[[str(v.vid), str(v.id), str(v.is_answer)] for v in upvotes]
    )

@router.get("/all", response_model=UsersListResponse, dependencies=[Depends(get_admin_user)])
def get_users(db: Session = Depends(get_db), skip: int = 0, limit: int = 100):
    """Get all users - Admin only access."""
    users = db.query(Users).offset(skip).limit(limit).all()
    
    user_items = [
        UserListItem(
            id=str(user.id),
            username=user.username,
            email=user.email,
            type=user.type,
            joined_since=user.created_at,
            googlelogin=user.googlelogin
        )
        for user in users
    ]
    
    return UsersListResponse(
        users=user_items,
        total=db.query(Users).count()
    )


@router.get("/{user_name}", response_model=UserPublicResponse)
def get_user(user_name: str, db: Session = Depends(get_db)):
    """Get public profile of a user by username."""
    user = db.query(Users).filter(Users.username == user_name).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get user's public information (questions only for privacy)
    questions = db.query(Question.qid, Question.title).filter(
        Question.userid == user.id
    ).all()
    answers = db.query(Answer.aid, Question.title).join(
        Question, Answer.qid == Question.qid
    ).filter(Answer.userid == user.id).all()

    return UserPublicResponse(
        username=user.username,
        profile_path=user.profile_path,
        joined_since=user.created_at,
        type= user.type ,
        questions=[[str(q.qid), q.title] for q in questions],
        answers=[[str(a.aid), a.title] for a in answers]
    )



@router.delete("/{user_name}")
def delete_user(user_name: str, db: Session = Depends(get_db), current_user: Users = Depends(get_admin_user)):
    """Delete a user - Admin only access."""
    # Remove the manual admin check - get_admin_user dependency already handles this
    user = db.query(Users).filter(Users.username == user_name).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(user)
    db.commit()
    
    return {"message": f"User {user_name} deleted successfully"}