from fastapi import APIRouter, HTTPException, Depends

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
    responses={404: {"description": "Not found"}}
)

@router.post("/login")
def login(username: str, password: str):
    pass


@router.post("/signup")
def signup(username: str, password: str):
    pass

@router.post("/google")
def google_auth(token: str):
    pass