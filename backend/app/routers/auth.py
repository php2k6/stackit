from fastapi import APIRouter, Body, HTTPException, Depends, status
from sqlalchemy.orm import Session
from fastapi.security import HTTPAuthorizationCredentials, OAuth2PasswordBearer
from app.models import Users
from app.database import get_db
from app.schemas.user_schemas import UserCreate, UserLogin, UserResponse
from app.auth import auth_handler

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
    responses={404: {"description": "Not found"}}
)

@router.post("/login")
def login(User: UserLogin = Body(...), db: Session = Depends(get_db)):
    """Authenticate user and return access token"""
    
    # Fetch user from database
    user = db.query(Users).filter(Users.username == User.username).first()
    
    # Fix: Compare User.password (plain) with user.password (hashed from DB)
    if not user or not auth_handler.verify_password(User.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token = auth_handler.create_access_token(data={"sub": user.username, "type": "access"})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/signup", status_code=201)
def signup(user: UserCreate = Body(...), db: Session = Depends(get_db)):
    """Sign up a new user."""

    # Check if user already exists (check both username and email)
    existing_user = db.query(Users).filter(
        (Users.username == user.username) | (Users.email == user.email)
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already registered"
        )

    # Hash the password before storing
    hashed_password = auth_handler.hash_password(user.password)
    
    # Create new user with hashed password
    user_data = user.model_dump()
    user_data['password'] = hashed_password
    
    new_user = Users(**user_data)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    user_response = UserResponse.model_validate(new_user)
    
    return {
        "msg": "User created successfully",
        "user": user_response
    }

@router.post("/google")
def google_auth(token: str):
    return {"message": "Google auth not implemented yet"}