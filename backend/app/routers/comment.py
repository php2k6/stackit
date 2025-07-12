from fastapi import APIRouter, HTTPException, Depends, status, Query
from sqlalchemy.orm import Session
from app.auth import get_current_user
from app.models import Users, Answer, Comment
from app.database import get_db
from app.schemas.comment_scheme import (
    CommentCreate,
    CommentCreateResponse,
    CommentResponse,
    CommentList
)
from uuid import UUID
from typing import List

router = APIRouter(
    prefix="/comments",
    tags=["Comments"],
    responses={404: {"description": "Not found"}}
)

@router.post("/{aid}", status_code=201, response_model=CommentCreateResponse)
def create_comment(
    aid: UUID,
    comment: CommentCreate,
    current_user: Users = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new comment for an answer."""
    
    # Check if answer exists
    answer = db.query(Answer).filter(Answer.aid == aid).first()
    if not answer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Answer not found"
        )
    
    # Create new comment
    new_comment = Comment(
        userid=current_user.id,
        message=comment.message,
        aid=aid
    )
    
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    
    return CommentCreateResponse(
        cid=new_comment.cid,
        created_at=new_comment.created_at
    )

@router.get("/{aid}", response_model=List[CommentResponse])
def get_comments(
    aid: UUID,
    db: Session = Depends(get_db),
    page: int = Query(default=1, ge=1, description="Page number"),
    per_page: int = Query(default=10, ge=1, le=50, description="Items per page")
):
    """Get all comments for a specific answer."""
    
    # Check if answer exists
    answer = db.query(Answer).filter(Answer.aid == aid).first()
    if not answer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Answer not found"
        )
    
    # Calculate offset for pagination
    offset = (page - 1) * per_page
    
    # Get comments for the answer (ordered by creation time - oldest first)
    comments = db.query(Comment).join(Users).filter(
        Comment.aid == aid
    ).order_by(Comment.created_at.asc()).offset(offset).limit(per_page).all()
    
    # Convert to response format
    return [
        CommentResponse(
            cid=c.cid,
            userid=c.userid,
            username=c.user.username,  # Get username from relationship
            message=c.message,
            aid=c.aid,
            created_at=c.created_at
        )
        for c in comments
    ]

@router.delete("/{cid}", status_code=204)
def delete_comment(
    cid: UUID,
    current_user: Users = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a comment. Can only be done by the comment author or admin."""
    
    # Get the comment
    comment = db.query(Comment).filter(Comment.cid == cid).first()
    
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )
    
    # Check if user can delete (owner or admin)
    if comment.userid != current_user.id and not current_user.type:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this comment"
        )
    
    # Delete the comment
    db.delete(comment)
    db.commit()
    
    return None  # 204 No Content

@router.get("/answer/{aid}/stats")
def get_comment_stats(aid: UUID, db: Session = Depends(get_db)):
    """Get comment statistics for an answer."""
    
    # Check if answer exists
    answer = db.query(Answer).filter(Answer.aid == aid).first()
    if not answer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Answer not found"
        )
    
    # Get total comments count
    total_comments = db.query(Comment).filter(Comment.aid == aid).count()
    
    return {
        "answer_id": aid,
        "total_comments": total_comments
    }

@router.put("/{cid}", response_model=CommentResponse)
def update_comment(
    cid: UUID,
    comment_update: CommentCreate,  # Reusing CommentCreate for update
    current_user: Users = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a comment. Can only be done by the comment author."""
    
    # Get the comment
    comment = db.query(Comment).filter(Comment.cid == cid).first()
    
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )
    
    # Check if user can update (owner only)
    if comment.userid != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this comment"
        )
    
    # Update comment message
    comment.message = comment_update.message
    db.commit()
    db.refresh(comment)
    
    return CommentResponse(
        cid=comment.cid,
        userid=comment.userid,
        username=comment.user.username,
        message=comment.message,
        aid=comment.aid,
        created_at=comment.created_at
    )