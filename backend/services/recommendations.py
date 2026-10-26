"""
StudyFlow AI - Recommendations Generator
Generates intelligent, actionable study advice based on active tasks and student workload.
"""

from typing import List, Dict, Any, Optional

def generate_recommendations(tasks: List[Dict[str, Any]], available_minutes: int = 180) -> List[Dict[str, Any]]:
    """
    Generates tailored advice cards based on active task priorities and deadlines.
    """
    active_tasks = [t for t in tasks if t.get("status") != "Completed"]
    if not active_tasks:
        return [{
            "id": "rec-all-done",
            "type": "success",
            "title": "All caught up!",
            "message": "You have completed all your pending tasks. Great job maintaining your momentum!",
            "action": "Plan Next Goals"
        }]

    # Active tasks are expected to be prioritized
    top_task = active_tasks[0]
    recs = []

    # 1. Primary Recommendation
    top_title = top_task.get("title", "assignment")
    top_subject = top_task.get("subject", "General")
    top_duration = top_task.get("remainingDuration") or top_task.get("estimatedDuration") or 60
    top_score = top_task.get("priorityScore", 80)

    recs.append({
        "id": "rec-top-priority",
        "type": "urgent",
        "title": f"Tackle {top_subject}: {top_title} First",
        "message": f"This task has the highest urgency score ({top_score}/100). Committing your first {min(top_duration, 60)} minutes will alleviate the largest deadline pressure.",
        "action": "Start Study Session",
        "taskId": top_task.get("id")
    })

    # 2. Check for overdue or next 24h tasks
    urgency_tasks = [
        t for t in active_tasks[1:]
        if (t.get("breakdown") and t["breakdown"].get("urgencyScore", 0) >= 80)
        or t.get("status") == "Overdue"
    ]
    if urgency_tasks:
        sec = urgency_tasks[0]
        recs.append({
            "id": "rec-urgency-warning",
            "type": "warning",
            "title": f"Upcoming Deadline: {sec.get('title')}",
            "message": f"Deadline is approaching soon for {sec.get('subject')}. Prepare materials right after finishing your primary task.",
            "action": "Review Task",
            "taskId": sec.get("id")
        })

    # 3. Workload pacing advice
    total_est = sum(t.get("remainingDuration") or t.get("estimatedDuration") or 60 for t in active_tasks)
    hours = total_est // 60
    mins = total_est % 60
    avail_hours = available_minutes // 60
    avail_mins = available_minutes % 60

    if total_est > available_minutes:
        recs.append({
            "id": "rec-pacing",
            "type": "strategy",
            "title": f"Total Queue ({hours}h {mins}m) Exceeds Today's Target ({avail_hours}h {avail_mins}m)",
            "message": f"Divide large assignments into focused 45-minute blocks. Focus today on your top 2 priority tasks and reschedule the rest.",
            "action": "Optimize Schedule"
        })
    else:
        recs.append({
            "id": "rec-pacing-healthy",
            "type": "info",
            "title": f"Healthy Study Load ({hours}h {mins}m)",
            "message": f"Your tasks comfortably fit into your {avail_hours}h study goal today. Keep a consistent pace with short 10-minute breaks.",
            "action": "View Timeline"
        })

    return recs
