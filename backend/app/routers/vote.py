from fastapi import APIRouter, HTTPException, Depends
from uuid import UUID
router = APIRouter(
    prefix="/vote",
    tags=["Votes"],
    responses={404: {"description": "Not found"}}
)
@router.post("/answer/{a_id}")
def vote_answer(a_id: UUID, vote: int):
    pass


@router.post("/question/{q_id}/")
def vote_question(q_id: UUID, vote: int):
    pass

@router.delete("/answer/{a_id}")
def delete_vote_answer(a_id: UUID): 
    pass    

@router.delete("/question/{q_id}")
def delete_vote_question(q_id: UUID): 
    pass