from fastapi import APIRouter, HTTPException, Depends
from uuid import UUID
router = APIRouter(
    prefix="/home",
    tags=["Home"],
    responses={404: {"description": "Not found"}}
)

@router.get("/")
def home():     
    pass

@router.get("/search")
def search_home(query: str):
    pass