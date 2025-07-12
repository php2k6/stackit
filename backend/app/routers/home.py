from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, and_, func
from datetime import datetime, timedelta
from app.models import Question, Users
from app.database import get_db
from app.schemas.question_schemas import QuestionResponse
from typing import List, Optional
from uuid import UUID

router = APIRouter(
    prefix="/home",
    tags=["Home"],
    responses={404: {"description": "Not found"}}
)

@router.get("/", response_model=List[QuestionResponse])
def home(
    db: Session = Depends(get_db),
    sort: str = Query(default="trending", description="Sort by: trending, latest, most_popular"),
    page: int = Query(default=1, ge=1, description="Page number"),
    per_page: int = Query(default=10, ge=1, le=50, description="Items per page"),
    tags: Optional[str] = Query(default=None, description="Filter by tags")
):
    """
    Get all questions with different sorting options:
    - trending: Questions created in last 24 hours sorted by votes, then all others by creation date
    - latest: Sort by creation date (newest first)
    - most_popular: Sort by votes (highest first)
    """
    
    # Calculate offset for pagination
    offset = (page - 1) * per_page
    
    # Base query
    query = db.query(Question)
    
    # Apply tags filter if provided
    if tags:
        query = query.filter(Question.tags.ilike(f"%{tags}%"))
    
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
    
    # Convert to response format
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

@router.get("/search", response_model=List[QuestionResponse])
def search_home(
    query: str = Query(..., min_length=1, description="Search query"),
    db: Session = Depends(get_db),
    sort: str = Query(default="latest", description="Sort by: trending, latest, most_popular"),
    page: int = Query(default=1, ge=1, description="Page number"),
    per_page: int = Query(default=10, ge=1, le=50, description="Items per page"),
    tags: Optional[str] = Query(default=None, description="Filter by tags")
):
    """
    Search questions by title, description, or tags with sorting options.
    """
    
    # Calculate offset for pagination
    offset = (page - 1) * per_page
    
    # Base search query - search in title, description, and tags
    search_query = db.query(Question).filter(
        Question.title.ilike(f"%{query}%") | 
        Question.desc.ilike(f"%{query}%") |
        Question.tags.ilike(f"%{query}%")
    )
    
    # Apply additional tags filter if provided
    if tags:
        search_query = search_query.filter(Question.tags.ilike(f"%{tags}%"))
    
    # Apply sorting
    if sort == "trending":
        twenty_four_hours_ago = datetime.utcnow() - timedelta(hours=24)
        
        # Prioritize recent questions with high votes
        trending_questions = search_query.filter(
            Question.created_at >= twenty_four_hours_ago
        ).order_by(desc(Question.votes), desc(Question.created_at)).offset(offset).limit(per_page).all()
        
        # Fill with older questions if needed
        if len(trending_questions) < per_page:
            remaining_limit = per_page - len(trending_questions)
            trending_qids = [q.qid for q in trending_questions]
            
            older_questions = search_query.filter(
                and_(
                    Question.created_at < twenty_four_hours_ago,
                    ~Question.qid.in_(trending_qids) if trending_qids else True
                )
            ).order_by(desc(Question.created_at)).limit(remaining_limit).all()
            
            questions = trending_questions + older_questions
        else:
            questions = trending_questions
            
    elif sort == "latest":
        questions = search_query.order_by(desc(Question.created_at)).offset(offset).limit(per_page).all()
        
    elif sort == "most_popular":
        questions = search_query.order_by(desc(Question.votes), desc(Question.created_at)).offset(offset).limit(per_page).all()
        
    else:
        raise HTTPException(status_code=400, detail="Invalid sort parameter. Use: trending, latest, or most_popular")
    
    # Convert to response format
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

@router.get("/stats")
def get_home_stats(db: Session = Depends(get_db)):
    """Get homepage statistics."""
    
    # Get counts
    total_questions = db.query(Question).count()
    total_users = db.query(Users).count()
    
    # Questions in last 24 hours
    twenty_four_hours_ago = datetime.utcnow() - timedelta(hours=24)
    questions_today = db.query(Question).filter(
        Question.created_at >= twenty_four_hours_ago
    ).count()
    
    # Most active user (most questions)
    most_active_user = db.query(
        Question.username, 
        func.count(Question.qid).label('question_count')
    ).group_by(Question.username).order_by(
        desc('question_count')
    ).first()
    
    return {
        "total_questions": total_questions,
        "total_users": total_users,
        "questions_today": questions_today,
        "most_active_user": {
            "username": most_active_user.username if most_active_user else None,
            "question_count": most_active_user.question_count if most_active_user else 0
        }
    }

@router.get("/trending-tags")
def get_trending_tags(db: Session = Depends(get_db), limit: int = Query(default=10, ge=1, le=20)):
    """Get most popular tags from recent questions."""
    
    # Get questions from last 7 days
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    
    questions = db.query(Question.tags).filter(
        and_(
            Question.created_at >= seven_days_ago,
            Question.tags.isnot(None),
            Question.tags != ""
        )
    ).all()
    
    # Count tag occurrences
    tag_counts = {}
    for question in questions:
        if question.tags:
            # Split tags by comma and clean them
            tags = [tag.strip().lower() for tag in question.tags.split(',')]
            for tag in tags:
                if tag:  # Ignore empty tags
                    tag_counts[tag] = tag_counts.get(tag, 0) + 1
    
    # Sort by count and return top tags
    trending_tags = sorted(tag_counts.items(), key=lambda x: x[1], reverse=True)[:limit]
    
    return {
        "trending_tags": [
            {"tag": tag, "count": count} 
            for tag, count in trending_tags
        ]
    }