from fastapi import APIRouter, HTTPException, Depends
from uuid import UUID
router = APIRouter(
    prefix="/notification",
    tags=["Notifications"],
    responses={404: {"description": "Not found"}}
)

@router.get("/")
def get_notifications():    
    pass    

@router.post("/read")
def mark_notification_as_read(notification_id: UUID):
    pass    