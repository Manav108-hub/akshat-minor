from fastapi import APIRouter, HTTPException, Request, status, Depends
from fastapi.responses import JSONResponse
from datetime import timedelta

from auth_utils import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from database import db
from schema import UserSignup, UserLogin

router = APIRouter()

@router.post("/signup")
async def signup(user: UserSignup):
    """Register a new user"""
    existing_user = await db["userLoginDetails"].find_one({"email": user.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    hashed_pw = hash_password(user.password)
    await db["userLoginDetails"].insert_one({
        "email": user.email,
        "hashed_password": hashed_pw
    })

    return {"message": "User created successfully"}


@router.post("/login")
async def login(user: UserLogin):
    """Login a user and set authentication cookie"""
    db_user = await db["userLoginDetails"].find_one({"email": user.email})

    if not db_user or not verify_password(user.password, db_user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid email or password"
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    token = create_access_token(
        data={"sub": user.email}, 
        expires_delta=access_token_expires
    )

    # Create response with cookie
    response = JSONResponse(content={"message": "Login successful"})
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,  # For security
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        expires=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite="lax",   # Allow cookies in same-site requests
        secure=False      # Set to True in production with HTTPS
    )
    return response


@router.post("/logout")
def logout():
    """Logout a user by clearing the authentication cookie"""
    response = JSONResponse(content={"message": "Logged out"})
    response.delete_cookie("access_token")
    return response

