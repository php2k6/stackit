from fastapi import APIRouter, HTTPException, Depends
from uuid import UUID
router = APIRouter(
    prefix="/answer",
    tags=["Answers"],
    responses={404: {"description": "Not found"}}
)


@router.post("/")
def create_answer(question_id: UUID, answer: str):
    pass

@router.delete("/{a_id}")
def delete_answer(a_id: UUID):
    pass    

@router.get("/{a_id}")
def get_answer(a_id: UUID): 
    pass    

@router.get("/{a_id}/accept")
def accept_answer(a_id: UUID):
    pass