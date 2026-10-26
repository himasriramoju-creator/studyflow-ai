export type TaskCategory =
  | 'Assignment'
  | 'Examination'
  | 'Project'
  | 'Revision'
  | 'Laboratory Work'
  | 'Personal Study';

export type ImportanceLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard' | 'Very Hard';

export type TaskStatus = 'Pending' | 'In Progress' | 'Completed' | 'Overdue';

export interface PriorityBreakdown {
  urgencyScore: number;
  importanceScore: number;
  difficultyScore: number;
  timeFitScore: number;
  rawScore: number;
  explanation: string;
}

export interface Subject {
  id: string;
  userId: string;
  name: string;
  code?: string;
  credits: number;
  color?: string;
  semester?: string;
  createdAt: string;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  subject: string;
  subjectId?: string;
  credits?: number; // Academic credit weight (1-6)
  category: TaskCategory;
  deadline: string; // ISO date-time string
  importance: ImportanceLevel;
  difficulty: DifficultyLevel;
  estimatedDuration: number; // in minutes
  remainingDuration: number; // in minutes
  status: TaskStatus;
  priorityScore: number; // 0 to 100
  breakdown?: PriorityBreakdown;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  points: number;
  streakDays: number;
  lastActiveDate: string;
  createdAt: string;
}

export interface StudyPreferences {
  userId: string;
  dailyAvailableMinutes: number;
  preferredSessionMinutes: number;
  breakDurationMinutes: number;
  preferredStartTime: string; // e.g. "09:00"
  preferredEndTime: string;   // e.g. "17:00"
  maxDailyHours: number;
}

export interface StudyScheduleSlot {
  id: string;
  taskId?: string;
  taskTitle: string;
  subject?: string;
  startTime: string; // e.g. "09:00 AM"
  endTime: string;   // e.g. "10:00 AM"
  startMinutes: number;
  endMinutes: number;
  durationMinutes: number;
  type: 'task' | 'break';
  completed: boolean;
  priorityScore?: number;
}

export interface Achievement {
  id: string;
  userId: string;
  achievementType: string;
  title: string;
  description: string;
  points: number;
  icon: string;
  earnedAt: string;
}

export interface StudySessionLog {
  id: string;
  userId: string;
  taskId?: string;
  taskTitle: string;
  subject: string;
  durationMinutes: number;
  date: string;
  completed: boolean;
}

export interface PriorityWeights {
  urgency: number;     // e.g. 0.40
  importance: number;  // e.g. 0.30
  difficulty: number;  // e.g. 0.20
  timeFit: number;     // e.g. 0.10
}
