from fastapi import APIRouter, HTTPException, Depends
from uuid import UUID
router = APIRouter(
    prefix="/comment",
    tags=["Users"],
    responses={404: {"description": "Not found"}}
)

@router.get("/{a_id}")
def get_comment(a_id: int):
    pass

@router.post("/{a_id}")
def create_comment(a_id: UUID, comment: str):
    pass    
@router.delete("/{c_id}")
def delete_comment(c_id: UUID):     
    pass    