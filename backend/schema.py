from pydantic import BaseModel, EmailStr
from typing import Optional

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

# Admin user creation with role
class UserCreateWithRole(UserSignup):
    role: str = "user"  # default to normal user

# Response schemas
class UserResponse(BaseModel):
    email: EmailStr
    message: str

class MessageResponse(BaseModel):
    message: str