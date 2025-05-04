from datetime import datetime, timedelta
from fastapi import Request, HTTPException, status
from jose import JWTError, jwt
from passlib.context import CryptContext
import os
from dotenv import load_dotenv
from database import db

load_dotenv()

# Security settings
SECRET_KEY = os.getenv("SECRET_KEY", "mysecretkey")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing setup
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        return email
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid credentials")

async def get_current_admin(request: Request):
    email = get_current_user(request)
    from database import db
    user = await db["userLoginDetails"].find_one({"email": email})
    if not user or user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized as admin")
    return email

async def update_user_habit_checkins(email: str):
    """Automatically updates habit check-ins on login with streak reset if missed."""
    habits_collection = db["habits"]
    today = datetime.utcnow().date()
    cursor = habits_collection.find({"user_email": email})
    async for habit in cursor:
        check_ins = habit.get("check_ins", [])
        last_checkin = check_ins[-1].date() if check_ins else None

        if last_checkin == today:
            continue  # Already checked in today

        if last_checkin is None:
            new_check_ins = [datetime.utcnow()]
        else:
            days_difference = (today - last_checkin).days
            if days_difference == 1:
                new_check_ins = check_ins + [datetime.utcnow()]
            else:
                new_check_ins = [datetime.utcnow()]

        await habits_collection.update_one(
            {"_id": habit["_id"]},
            {"$set": {"check_ins": new_check_ins}}
        )