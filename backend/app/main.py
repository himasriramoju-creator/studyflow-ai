"""
StudyFlow AI - FastAPI Backend Main Application
"""

import os
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from backend.app.database import engine, Base
from backend.services.prioritization import prioritize_tasks
from backend.services.study_scheduler import generate_study_schedule
from backend.services.recommendations import generate_recommendations

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="StudyFlow AI API",
    description="Intelligent AI Task Prioritizer & Study Planner Backend",
    version="1.0.0"
)

# CORS configuration
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health_check():
    return {
        "status": "healthy",
        "service": "StudyFlow AI API",
        "version": "1.0.0"
    }

@app.post("/api/prioritize")
def prioritize_endpoint(payload: dict):
    tasks = payload.get("tasks", [])
    avail = payload.get("availableMinutes", 180)
    weights = payload.get("weights")
    result = prioritize_tasks(tasks, avail, weights)
    return {"tasks": result}

@app.post("/api/planner/generate")
def planner_endpoint(payload: dict):
    tasks = payload.get("tasks", [])
    start_time = payload.get("startTime", "09:00")
    end_time = payload.get("endTime", "17:00")
    session_mins = payload.get("sessionMinutes", 45)
    break_mins = payload.get("breakMinutes", 15)
    max_hours = payload.get("maxDailyHours", 6.0)
    
    # First prioritize
    prioritized = prioritize_tasks(tasks)
    schedule_data = generate_study_schedule(
        prioritized, start_time, end_time, session_mins, break_mins, max_hours
    )
    return schedule_data

@app.post("/api/recommendations")
def recommendations_endpoint(payload: dict):
    tasks = payload.get("tasks", [])
    avail = payload.get("availableMinutes", 180)
    recs = generate_recommendations(tasks, avail)
    return {"recommendations": recs}
