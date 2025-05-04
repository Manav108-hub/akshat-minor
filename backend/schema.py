from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# Auth Models
class UserSignup(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class UserCreateWithRole(UserSignup):
    role: str = "user"

class UserResponse(BaseModel):
    email: EmailStr
    message: str

class MessageResponse(BaseModel):
    message: str

# Habit Models
class HabitCreate(BaseModel):
    name: str
    description: str

class HabitResponse(BaseModel):
    id: str
    name: str
    description: str
    start_date: datetime
    check_ins: List[datetime]
    current_streak: int  # Calculated on response

    class Config:
        arbitrary_types_allowed = True