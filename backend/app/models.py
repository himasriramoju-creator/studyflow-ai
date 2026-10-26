import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from backend.app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    full_name = Column(String(120), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    points = Column(Integer, default=0)
    streak_days = Column(Integer, default=1)
    last_active_date = Column(String(20), default=lambda: datetime.now(timezone.utc).strftime("%Y-%m-%d"))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    tasks = relationship("Task", back_populates="owner", cascade="all, delete-orphan")
    preferences = relationship("StudyPreference", back_populates="user", uselist=False, cascade="all, delete-orphan")
    achievements = relationship("Achievement", back_populates="user", cascade="all, delete-orphan")

class Task(Base):
    __tablename__ = "tasks"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, default="")
    subject = Column(String(100), nullable=False)
    category = Column(String(50), default="Assignment") # Assignment, Examination, Project, Revision, Laboratory Work, Personal Study
    deadline = Column(String(50), nullable=False) # ISO String
    importance = Column(String(20), default="Medium") # Low, Medium, High, Critical
    difficulty = Column(String(20), default="Medium") # Easy, Medium, Hard, Very Hard
    estimated_duration = Column(Integer, default=60) # minutes
    remaining_duration = Column(Integer, default=60) # minutes
    status = Column(String(30), default="Pending") # Pending, In Progress, Completed, Overdue
    priority_score = Column(Float, default=50.0)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    owner = relationship("User", back_populates="tasks")

class StudyPreference(Base):
    __tablename__ = "study_preferences"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False)
    daily_available_minutes = Column(Integer, default=180)
    preferred_session_minutes = Column(Integer, default=45)
    break_duration_minutes = Column(Integer, default=15)
    preferred_start_time = Column(String(10), default="09:00")
    preferred_end_time = Column(String(10), default="17:00")
    max_daily_hours = Column(Float, default=6.0)

    user = relationship("User", back_populates="preferences")

class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    achievement_type = Column(String(80), nullable=False)
    title = Column(String(120), nullable=False)
    description = Column(String(255), default="")
    points = Column(Integer, default=50)
    icon = Column(String(50), default="Award")
    earned_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="achievements")
