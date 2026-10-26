"""
Unit tests for StudyFlow AI Prioritization & Scheduler
"""

import unittest
from datetime import datetime, timezone, timedelta
from backend.services.prioritization import (
    calculate_urgency,
    calculate_time_fit,
    calculate_task_priority,
    prioritize_tasks
)
from backend.services.study_scheduler import generate_study_schedule

class TestPrioritization(unittest.TestCase):
    def test_overdue_task_urgency(self):
        # A task whose deadline is in the past must yield 100.0 urgency
        past_dl = (datetime.now(timezone.utc) - timedelta(hours=5)).isoformat()
        urgency = calculate_urgency(past_dl)
        self.assertEqual(urgency, 100.0)

    def test_future_task_urgency(self):
        # A task 10 days in the future should have low urgency
        future_dl = (datetime.now(timezone.utc) + timedelta(days=10)).isoformat()
        urgency = calculate_urgency(future_dl)
        self.assertLess(urgency, 30.0)

    def test_importance_weights(self):
        now = datetime.now(timezone.utc)
        dl = (now + timedelta(days=2)).isoformat()
        task_crit = {
            "id": "1",
            "title": "Final Exam",
            "deadline": dl,
            "importance": "Critical",
            "difficulty": "Hard",
            "estimatedDuration": 120
        }
        task_low = {
            "id": "2",
            "title": "Optional Reading",
            "deadline": dl,
            "importance": "Low",
            "difficulty": "Easy",
            "estimatedDuration": 30
        }
        res_crit = calculate_task_priority(task_crit, 180, current_time=now)
        res_low = calculate_task_priority(task_low, 180, current_time=now)
        self.assertGreater(res_crit["priorityScore"], res_low["priorityScore"])

    def test_study_scheduler(self):
        tasks = [
            {"id": "t1", "title": "Math Assignment", "subject": "Math", "estimatedDuration": 60, "priorityScore": 90, "status": "In Progress"},
            {"id": "t2", "title": "Physics Review", "subject": "Physics", "estimatedDuration": 45, "priorityScore": 75, "status": "Pending"}
        ]
        result = generate_study_schedule(tasks, start_time_str="09:00", end_time_str="12:00")
        self.assertGreater(len(result["schedule"]), 0)
        self.assertIn("totalStudyMinutes", result)
        self.assertFalse(result["isOverloaded"])

if __name__ == "__main__":
    unittest.main()
