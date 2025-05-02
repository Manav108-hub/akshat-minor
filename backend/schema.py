from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any

# Authentication schemas
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

# Response schemas
class UserResponse(BaseModel):
    email: EmailStr
    message: str

class UserProfile(BaseModel):
    email: EmailStr

class UserSettings(BaseModel):
    email: EmailStr
    settings: Dict[str, Any]

class MessageResponse(BaseModel):
    message: str