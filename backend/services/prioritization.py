"""
StudyFlow AI - Prioritization Service
Calculates explainable priority scores for college student tasks.
Formula:
Priority Score = (0.40 * Urgency) + (0.30 * Importance) + (0.20 * Difficulty) + (0.10 * Time Fit)
"""

import sys
import json
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

IMPORTANCE_MAP = {
    "Low": 25.0,
    "Medium": 50.0,
    "High": 75.0,
    "Critical": 100.0
}

DIFFICULTY_MAP = {
    "Easy": 25.0,
    "Medium": 50.0,
    "Hard": 75.0,
    "Very Hard": 100.0
}

DEFAULT_WEIGHTS = {
    "urgency": 0.40,
    "importance": 0.30,
    "difficulty": 0.20,
    "timeFit": 0.10
}


def calculate_urgency(deadline_iso: str, current_time: Optional[datetime] = None) -> float:
    """
    Computes Urgency score from 0 to 100.
    Overdue tasks get max urgency (100).
    Tasks within 12h: 90 - 99
    Tasks within 24h: 80 - 90
    Tasks within 3 days: 60 - 80
    Tasks within 7 days: 30 - 60
    Tasks > 7 days: scaled down gracefully towards 0.
    """
    try:
        # Support ISO formats with or without timezone
        dl = datetime.fromisoformat(deadline_iso.replace("Z", "+00:00"))
        if dl.tzinfo is None:
            dl = dl.replace(tzinfo=timezone.utc)
    except Exception:
        return 50.0

    now = current_time or datetime.now(timezone.utc)
    diff = dl - now
    hours_left = diff.total_seconds() / 3600.0

    if hours_left <= 0:
        # Overdue: high urgency boost
        return 100.0
    elif hours_left <= 12:
        return 90.0 + (12.0 - hours_left) * (10.0 / 12.0)
    elif hours_left <= 24:
        return 75.0 + (24.0 - hours_left) * (15.0 / 12.0)
    elif hours_left <= 72:  # 3 days
        return 50.0 + (72.0 - hours_left) * (25.0 / 48.0)
    elif hours_left <= 168:  # 7 days
        return 20.0 + (168.0 - hours_left) * (30.0 / 96.0)
    else:
        # Beyond 7 days
        score = 20.0 - min(20.0, (hours_left - 168.0) / 24.0)
        return max(5.0, score)


def calculate_time_fit(estimated_minutes: int, available_minutes: int) -> float:
    """
    Time Fit (0-100):
    How neatly the task duration fits into available study time.
    Ideal: estimated_minutes <= available_minutes and utilizes 50%-100% of the session.
    If task exceeds available time, it is penalized unless split.
    """
    if available_minutes <= 0 or estimated_minutes <= 0:
        return 50.0

    ratio = estimated_minutes / float(available_minutes)
    if 0.4 <= ratio <= 1.0:
        # Perfect fit to complete in today's window
        return 100.0 - abs(0.8 - ratio) * 40.0
    elif ratio < 0.4:
        # Small quick win, high score
        return 85.0
    else:
        # Exceeds current single session; needs sub-session pacing
        excess_penalty = min(70.0, (ratio - 1.0) * 40.0)
        return max(20.0, 100.0 - excess_penalty)


def calculate_task_priority(
    task: Dict[str, Any],
    available_daily_minutes: int = 180,
    weights: Optional[Dict[str, float]] = None,
    current_time: Optional[datetime] = None
) -> Dict[str, Any]:
    """
    Calculates priority score and detailed mathematical breakdown.
    """
    w = weights or DEFAULT_WEIGHTS
    importance_str = task.get("importance", "Medium")
    difficulty_str = task.get("difficulty", "Medium")
    deadline_str = task.get("deadline", "")
    est_duration = task.get("remainingDuration") or task.get("estimatedDuration") or 60

    urgency_val = calculate_urgency(deadline_str, current_time)
    importance_val = IMPORTANCE_MAP.get(importance_str, 50.0)
    difficulty_val = DIFFICULTY_MAP.get(difficulty_str, 50.0)
    time_fit_val = calculate_time_fit(est_duration, available_daily_minutes)

    # Normalized score calculation
    raw_score = (
        (w.get("urgency", 0.40) * urgency_val) +
        (w.get("importance", 0.30) * importance_val) +
        (w.get("difficulty", 0.20) * difficulty_val) +
        (w.get("timeFit", 0.10) * time_fit_val)
    )

    score = round(min(100.0, max(0.0, raw_score)), 1)

    # Human-readable explainable rationale
    urgency_desc = (
        "Immediate deadline / overdue" if urgency_val >= 90
        else "Deadline within 24h" if urgency_val >= 75
        else "Upcoming within 3 days" if urgency_val >= 50
        else "Far deadline"
    )

    fit_desc = (
        "Ideal single-session duration" if time_fit_val >= 80
        else "Manageable duration" if time_fit_val >= 50
        else "Large workload; requires dividing into study blocks"
    )

    explanation = (
        f"{urgency_desc} (+{round(w.get('urgency', 0.4)*urgency_val, 1)} pts), "
        f"{importance_str} importance (+{round(w.get('importance', 0.3)*importance_val, 1)} pts), "
        f"{difficulty_str} challenge (+{round(w.get('difficulty', 0.2)*difficulty_val, 1)} pts). "
        f"{fit_desc}."
    )

    return {
        "priorityScore": score,
        "breakdown": {
            "urgencyScore": round(urgency_val, 1),
            "importanceScore": round(importance_val, 1),
            "difficultyScore": round(difficulty_val, 1),
            "timeFitScore": round(time_fit_val, 1),
            "rawScore": score,
            "explanation": explanation
        }
    }


def prioritize_tasks(
    tasks: List[Dict[str, Any]],
    available_daily_minutes: int = 180,
    weights: Optional[Dict[str, float]] = None
) -> List[Dict[str, Any]]:
    """
    Filters out completed tasks and sorts active tasks by priority score descending.
    """
    active_tasks = []
    completed_tasks = []

    for task in tasks:
        if task.get("status") == "Completed":
            task_copy = dict(task)
            task_copy["priorityScore"] = 0
            completed_tasks.append(task_copy)
        else:
            scored = calculate_task_priority(task, available_daily_minutes, weights)
            task_copy = dict(task)
            task_copy["priorityScore"] = scored["priorityScore"]
            task_copy["breakdown"] = scored["breakdown"]
            active_tasks.append(task_copy)

    # Sort active tasks by priorityScore descending, then by deadline
    active_tasks.sort(key=lambda t: (-t["priorityScore"], t.get("deadline", "")))

    return active_tasks + completed_tasks


if __name__ == "__main__":
    # CLI handler for stdin/stdout JSON IPC
    try:
        input_data = sys.stdin.read()
        if input_data.strip():
            payload = json.loads(input_data)
            tasks = payload.get("tasks", [])
            avail = payload.get("availableMinutes", 180)
            weights = payload.get("weights", DEFAULT_WEIGHTS)
            result = prioritize_tasks(tasks, avail, weights)
            print(json.dumps({"success": True, "tasks": result}))
        else:
            print(json.dumps({"success": False, "error": "No input provided"}))
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))
