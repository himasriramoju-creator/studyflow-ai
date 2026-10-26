from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

class UserRegister(BaseModel):
    full_name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    full_name: str
    email: str
    points: int
    streak_days: int
    created_at: datetime

    class Config:
        from_attributes = True

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = ""
    subject: str
    category: str
    deadline: str
    importance: str
    difficulty: str
    estimated_duration: int
    remaining_duration: Optional[int] = None
    status: Optional[str] = "Pending"

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    subject: Optional[str] = None
    category: Optional[str] = None
    deadline: Optional[str] = None
    importance: Optional[str] = None
    difficulty: Optional[str] = None
    estimated_duration: Optional[int] = None
    remaining_duration: Optional[int] = None
    status: Optional[str] = None

class TaskResponse(TaskBase):
    id: str
    user_id: str
    priority_score: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
