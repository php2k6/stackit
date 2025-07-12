from fastapi import APIRouter, HTTPException, Depends
from uuid import UUID

router = APIRouter(
    prefix="/question",
    tags=["Questions"],
    responses={404: {"description": "Not found"}}
)
#all users can access this
@router.get("/{q_id}")
def get_question(q_id: UUID):
    pass

@router.delete("/{q_id}")
def delete_question(q_id: UUID):
    pass

@router.post("/")
def create_question(question: str):
    pass        


