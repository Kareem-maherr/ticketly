from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "admin"
    CLIENT = "client"

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    website: Optional[str] = None
    company: Optional[str] = None

class UserInDB(UserBase):
    id: str = Field(..., alias="_id")
    phone: Optional[str] = None
    address: Optional[str] = None
    website: Optional[str] = None
    company: Optional[str] = None
    hashed_password: str
    is_admin: bool = False

class User(UserInDB):
    pass
