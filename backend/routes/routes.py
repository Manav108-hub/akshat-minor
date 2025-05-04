from fastapi import APIRouter, HTTPException, Request, status, Depends, BackgroundTasks
from fastapi.responses import JSONResponse
from datetime import datetime, timedelta
from typing import List, Optional
from bson import ObjectId

from auth_utils import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
    get_current_admin,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    update_user_habit_checkins
)
from database import db
from schema import (
    UserSignup, 
    UserLogin, 
    UserCreateWithRole,
    HabitCreate,
    HabitResponse
)

router = APIRouter()

# -------------------------------
# Auth Routes
# -------------------------------

@router.post("/signup")
async def signup(user: UserSignup):
    collection = db["userLoginDetails"]
    existing_user = await collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pw = hash_password(user.password)
    await collection.insert_one({
        "email": user.email,
        "hashed_password": hashed_pw
    })
    return {"message": "User created successfully"}

@router.post("/login")
async def login(user: UserLogin, background_tasks: BackgroundTasks):
    collection = db["userLoginDetails"]
    db_user = await collection.find_one({"email": user.email})

    if not db_user or not verify_password(user.password, db_user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(
        data={"sub": user.email}, 
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    response = JSONResponse(content={"message": "Login successful"})
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        expires=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite="lax",
        secure=False,
        domain="localhost",  # ✅ Ensure consistent domain
        path="/"  # ✅ Ensure consistent path
    )
    background_tasks.add_task(update_user_habit_checkins, db_user["email"])
    return response

@router.post("/logout")
def logout():
    response = JSONResponse(content={"message": "Logged out"})
    response.delete_cookie("access_token")
    return response

# -------------------------------
# Admin Routes
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

# -------------------------------
# Habit Routes
# -------------------------------

@router.post("/habits", response_model=HabitResponse)
async def create_habit(habit: HabitCreate, current_user: str = Depends(get_current_user)):
    habits_collection = db["habits"]
    habit_data = {
        "user_email": current_user,
        "name": habit.name,
        "description": habit.description,
        "start_date": datetime.utcnow(),
        "check_ins": []
    }
    result = await habits_collection.insert_one(habit_data)
    habit_doc = await habits_collection.find_one({"_id": result.inserted_id})
    habit_doc["id"] = str(habit_doc["_id"])
    habit_doc["current_streak"] = len(habit_doc["check_ins"])
    return habit_doc

@router.get("/habits", response_model=List[HabitResponse])
async def get_habits(current_user: str = Depends(get_current_user)):
    habits_collection = db["habits"]
    habits = []
    async for habit in habits_collection.find({"user_email": current_user}):
        habit["id"] = str(habit["_id"])
        habit["current_streak"] = len(habit["check_ins"])
        habits.append(habit)
    return habits

@router.get("/progress")
async def get_progress(current_user: str = Depends(get_current_user)):
    habits_collection = db["habits"]
    user_habits = await habits_collection.find({"user_email": current_user}).to_list(length=100)
    
    total_habits = len(user_habits)
    completed_today = sum(1 for habit in user_habits if any(check_in.date() == datetime.utcnow().date() for check_in in habit.get("check_ins", [])))

    return {
        "completedToday": completed_today,
        "totalHabits": total_habits
    }

@router.post("/check-in/{habit_id}")
async def mark_habit_as_done(habit_id: str, current_user: str = Depends(get_current_user)):
    habits_collection = db["habits"]
    
    # Ensure user owns the habit
    habit = await habits_collection.find_one({"_id": ObjectId(habit_id), "user_email": current_user})
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")

    today = datetime.utcnow().date()
    check_ins = habit.get("check_ins", [])
    last_checkin = check_ins[-1].date() if check_ins else None

    if last_checkin != today:
        check_ins.append(datetime.utcnow())
        await habits_collection.update_one(
            {"_id": ObjectId(habit_id)},
            {"$set": {"check_ins": check_ins}}
        )

    # Fetch updated habit
    updated_habit = await habits_collection.find_one({"_id": ObjectId(habit_id)})
    
    # Convert ObjectId to string manually
    updated_habit["id"] = str(updated_habit["_id"])
    updated_habit["current_streak"] = len(updated_habit["check_ins"])
    del updated_habit["_id"]  # Optional: remove _id to avoid serialization issues

    return updated_habit

@router.get("/me")
async def get_me(current_user: str = Depends(get_current_user)):
    return {"email": current_user}