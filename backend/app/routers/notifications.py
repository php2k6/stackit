from fastapi import APIRouter, HTTPException, Depends, status, Query, Body
from sqlalchemy.orm import Session
from app.auth import get_current_user
from app.models import Users, Notification
from app.database import get_db
from app.schemas.notification_schema import (
    NotificationResponse,
    NotificationList,
    NotificationMarkRead,
    NotificationStats,
    NotificationType
)
from uuid import UUID
from typing import List, Optional

router = APIRouter(
    prefix="/notification",
    tags=["Notifications"],
    responses={404: {"description": "Not found"}}
)

@router.get("/", response_model=NotificationList)
def get_notifications(
    current_user: Users = Depends(get_current_user),
    db: Session = Depends(get_db),
    page: int = Query(default=1, ge=1, description="Page number"),
    per_page: int = Query(default=10, ge=1, le=50, description="Items per page"),
    unread_only: bool = Query(default=False, description="Show only unread notifications"),
    type_filter: Optional[NotificationType] = Query(default=None, description="Filter by notification type")
):
    """Get notifications for the current user."""
    
    # Calculate offset for pagination
    offset = (page - 1) * per_page
    
    # Base query for user's notifications
    query = db.query(Notification).filter(Notification.userid == current_user.id)
    
    # Apply filters
    if unread_only:
        query = query.filter(Notification.is_read == False)
    
    if type_filter:
        query = query.filter(Notification.type == type_filter.value)
    
    # Get total count before pagination
    total = query.count()
    
    # Get unread count
    unread_count = db.query(Notification).filter(
        Notification.userid == current_user.id,
        Notification.is_read == False
    ).count()
    
    # Apply pagination and ordering (newest first)
    notifications = query.order_by(
        Notification.created_at.desc()
    ).offset(offset).limit(per_page).all()
    
    # Convert to response format
    notification_responses = [
        NotificationResponse(
            nid=n.nid,
            userid=n.userid,
            username=current_user.username,  # Current user's username
            is_read=n.is_read,
            content=n.content,
            type=NotificationType(n.type),
            created_at=n.created_at
        )
        for n in notifications
    ]
    
    return NotificationList(
        notifications=notification_responses,
        total=total,
        unread_count=unread_count,
        page=page,
        per_page=per_page
    )

@router.post("/read", status_code=200)
def mark_notification_as_read(
    notification_data: dict = Body(..., example={"notification_id": "uuid-here"}),
    current_user: Users = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark a specific notification as read."""
    
    notification_id = UUID(notification_data["notification_id"])
    
    # Find the notification
    notification = db.query(Notification).filter(
        Notification.nid == notification_id,
        Notification.userid == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    # Mark as read
    notification.is_read = True
    db.commit()
    db.refresh(notification)
    
    return {
        "message": "Notification marked as read",
        "notification_id": notification_id,
        "is_read": notification.is_read
    }

@router.post("/read-all", status_code=200)
def mark_all_notifications_as_read(
    current_user: Users = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark all notifications as read for the current user."""
    
    # Update all unread notifications for the user
    updated_count = db.query(Notification).filter(
        Notification.userid == current_user.id,
        Notification.is_read == False
    ).update({"is_read": True})
    
    db.commit()
    
    return {
        "message": f"Marked {updated_count} notifications as read",
        "updated_count": updated_count
    }

@router.delete("/{notification_id}", status_code=204)
def delete_notification(
    notification_id: UUID,
    current_user: Users = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a specific notification."""
    
    # Find the notification
    notification = db.query(Notification).filter(
        Notification.nid == notification_id,
        Notification.userid == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    # Delete the notification
    db.delete(notification)
    db.commit()
    
    return None  # 204 No Content

@router.get("/stats", response_model=NotificationStats)
def get_notification_stats(
    current_user: Users = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get notification statistics for the current user."""
    
    # Get total notifications
    total = db.query(Notification).filter(
        Notification.userid == current_user.id
    ).count()
    
    # Get unread notifications
    unread = db.query(Notification).filter(
        Notification.userid == current_user.id,
        Notification.is_read == False
    ).count()
    
    # Calculate read notifications
    read = total - unread
    
    return NotificationStats(
        total_notifications=total,
        unread_notifications=unread,
        read_notifications=read
    )

@router.get("/unread", response_model=List[NotificationResponse])
def get_unread_notifications(
    current_user: Users = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = Query(default=5, ge=1, le=20, description="Number of recent unread notifications")
):
    """Get recent unread notifications for the current user."""
    
    # Get recent unread notifications
    notifications = db.query(Notification).filter(
        Notification.userid == current_user.id,
        Notification.is_read == False
    ).order_by(
        Notification.created_at.desc()
    ).limit(limit).all()
    
    return [
        NotificationResponse(
            nid=n.nid,
            userid=n.userid,
            username=current_user.username,
            is_read=n.is_read,
            content=n.content,
            type=NotificationType(n.type),
            created_at=n.created_at
        )
        for n in notifications
    ]

# Helper function to create notifications (can be used by other modules)
def create_notification(
    db: Session,
    user_id: UUID,
    content: str,
    notification_type: NotificationType
):
    """Helper function to create a new notification."""
    
    new_notification = Notification(
        userid=user_id,
        content=content,
        type=notification_type.value,
        is_read=False
    )
    
    db.add(new_notification)
    db.commit()
    db.refresh(new_notification)
    
    return new_notification