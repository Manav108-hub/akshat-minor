from fastapi import APIRouter, HTTPException, Request, status, Depends
from fastapi.responses import JSONResponse
from datetime import timedelta

from auth_utils import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
    get_current_admin,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from database import db
from schema import UserSignup, UserLogin, UserCreateWithRole

router = APIRouter()

# -------------------------------
# Auth Routes (unchanged)
# -------------------------------

@router.post("/signup")
async def signup(user: UserSignup):
    collection = db["userLoginDetails"]
    existing_user = await collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    hashed_pw = hash_password(user.password)
    await collection.insert_one({
        "email": user.email,
        "hashed_password": hashed_pw
    })

    return {"message": "User created successfully"}

@router.post("/login")
async def login(user: UserLogin):
    collection = db["userLoginDetails"]
    db_user = await collection.find_one({"email": user.email})

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

    response = JSONResponse(content={"message": "Login successful"})
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        expires=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite="lax",
        secure=False
    )
    return response

@router.post("/logout")
def logout():
    response = JSONResponse(content={"message": "Logged out"})
    response.delete_cookie("access_token")
    return response

# -------------------------------
# Admin Routes (newly added)
# -------------------------------

@router.get("/admin/users")
async def get_users(_: str = Depends(get_current_admin)):
    users = []
    async for user in db["userLoginDetails"].find({}, {"_id": 0, "hashed_password": 0}):
        users.append(user)
    return users

@router.post("/admin/users")
async def create_user(user: UserCreateWithRole, _: str = Depends(get_current_admin)):
    collection = db["userLoginDetails"]
    existing_user = await collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = hash_password(user.password)
    await collection.insert_one({
        "email": user.email,
        "hashed_password": hashed_pw,
        "role": user.role
    })
    return {"message": "User created successfully"}