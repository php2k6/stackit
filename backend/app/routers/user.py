from fastapi import APIRouter, HTTPException, Depends

router = APIRouter(
    prefix="/user",
    tags=["Users"],
    responses={404: {"description": "Not found"}}
)


@router.get("/me")
def get_me():
    pass

@router.get("/{user_name}")
def get_user(user_name: str):
    pass

#only admin can access this
@router.get("/all")
def get_users():
    pass

#only admin can access this
@router.delete("/{user_name}")
def delete_user(user_name: str):
    pass