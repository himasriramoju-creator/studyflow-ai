"""
StudyFlow AI - Daily Study Scheduler Service
Generates realistic study schedules fitting within student study window,
inserting breaks and session pacing.
"""

from typing import List, Dict, Any, Tuple
from datetime import datetime, timedelta

def parse_time_to_minutes(time_str: str) -> int:
    """Converts '09:00' or '9:00 AM' to minutes from midnight."""
    cleaned = time_str.strip().upper()
    if "AM" in cleaned or "PM" in cleaned:
        t = datetime.strptime(cleaned, "%I:%M %p" if ":" in cleaned else "%I %p")
        return t.hour * 60 + t.minute
    parts = cleaned.split(":")
    return int(parts[0]) * 60 + int(parts[1])

def format_minutes_to_time(minutes: int) -> str:
    """Converts minutes from midnight to readable 12-hour format e.g. '09:30 AM'."""
    hours = (minutes // 60) % 24
    mins = minutes % 60
    period = "AM" if hours < 12 else "PM"
    display_hour = hours % 12
    if display_hour == 0:
        display_hour = 12
    return f"{display_hour:02d}:{mins:02d} {period}"

def generate_study_schedule(
    prioritized_tasks: List[Dict[str, Any]],
    start_time_str: str = "09:00",
    end_time_str: str = "17:00",
    preferred_session_mins: int = 45,
    break_duration_mins: int = 15,
    max_daily_hours: float = 6.0
) -> Dict[str, Any]:
    """
    Creates dynamic daily study plan blocks.
    Respects start/end window, maximum hours, and break buffers.
    """
    start_min = parse_time_to_minutes(start_time_str)
    end_min = parse_time_to_minutes(end_time_str)
    
    total_window_mins = max(0, end_min - start_min)
    max_allowed_study_mins = int(min(total_window_mins, max_daily_hours * 60))

    schedule_slots = []
    current_time_min = start_min
    total_study_allocated = 0
    total_break_allocated = 0
    uncompleted_active_tasks = [t for t in prioritized_tasks if t.get("status") != "Completed"]

    total_task_demand = sum(
        t.get("remainingDuration") or t.get("estimatedDuration") or 60
        for t in uncompleted_active_tasks
    )

    is_overloaded = total_task_demand > max_allowed_study_mins
    overload_minutes = max(0, total_task_demand - max_allowed_study_mins)

    slot_counter = 1

    for task in uncompleted_active_tasks:
        if current_time_min >= end_min or total_study_allocated >= max_allowed_study_mins:
            break

        task_remaining = task.get("remainingDuration") or task.get("estimatedDuration") or 60
        
        # We can split large tasks into chunks of preferred_session_mins
        while task_remaining > 0 and current_time_min < end_min and total_study_allocated < max_allowed_study_mins:
            session_len = min(task_remaining, preferred_session_mins)
            
            # Don't exceed remaining daily quota
            available_left = min(end_min - current_time_min, max_allowed_study_mins - total_study_allocated)
            if available_left < 15:
                # Less than 15 mins left, stop scheduling
                break

            allocated_len = min(session_len, available_left)
            slot_start = current_time_min
            slot_end = current_time_min + allocated_len

            schedule_slots.append({
                "id": f"slot-{slot_counter}",
                "taskId": task.get("id"),
                "taskTitle": task.get("title"),
                "subject": task.get("subject"),
                "startTime": format_minutes_to_time(slot_start),
                "endTime": format_minutes_to_time(slot_end),
                "startMinutes": slot_start,
                "endMinutes": slot_end,
                "durationMinutes": allocated_len,
                "type": "task",
                "completed": False,
                "priorityScore": task.get("priorityScore", 50)
            })
            slot_counter += 1
            current_time_min = slot_end
            total_study_allocated += allocated_len
            task_remaining -= allocated_len

            # Insert break if time permits and task still has remaining or there's next slot
            if current_time_min + break_duration_mins <= end_min and total_study_allocated < max_allowed_study_mins:
                break_start = current_time_min
                break_end = current_time_min + break_duration_mins
                schedule_slots.append({
                    "id": f"slot-{slot_counter}",
                    "taskTitle": "Rest & Refreshment Break",
                    "startTime": format_minutes_to_time(break_start),
                    "endTime": format_minutes_to_time(break_end),
                    "startMinutes": break_start,
                    "endMinutes": break_end,
                    "durationMinutes": break_duration_mins,
                    "type": "break",
                    "completed": False
                })
                slot_counter += 1
                current_time_min = break_end
                total_break_allocated += break_duration_mins

    return {
        "schedule": schedule_slots,
        "totalStudyMinutes": total_study_allocated,
        "totalBreakMinutes": total_break_allocated,
        "totalTasksScheduled": len(set(s["taskId"] for s in schedule_slots if s.get("taskId"))),
        "isOverloaded": is_overloaded,
        "overloadMinutes": overload_minutes,
        "advice": (
            f"Heads up: Your remaining workload ({total_task_demand//60}h {total_task_demand%60}m) "
            f"exceeds your {max_allowed_study_mins//60}h daily study budget. "
            f"StudyFlow scheduled the highest priority tasks first; consider shifting non-urgent tasks to tomorrow."
            if is_overloaded
            else f"Optimal study plan generated! Balanced {total_study_allocated//60}h {total_study_allocated%60}m of focused study with {total_break_allocated}m of rest."
        )
    }
