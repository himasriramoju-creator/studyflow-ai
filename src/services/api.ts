import { Task, User, StudyPreferences, Achievement, PriorityWeights, StudyScheduleSlot, Subject } from '../types';

const API_BASE = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('studyflow_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function fetchWithAuth<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Tasks
  getTasks: () => fetchWithAuth<{ tasks: Task[] }>('/tasks'),
  createTask: (taskData: Partial<Task>) =>
    fetchWithAuth<{ task: Task }>('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    }),
  updateTask: (id: string, updates: Partial<Task>) =>
    fetchWithAuth<{ task: Task }>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  deleteTask: (id: string) =>
    fetchWithAuth<{ message: string }>(`/tasks/${id}`, {
      method: 'DELETE',
    }),

  // Subjects & Credits
  getSubjects: () => fetchWithAuth<{ subjects: Subject[] }>('/subjects'),
  createSubject: (subjectData: { name: string; code?: string; credits: number; color?: string; semester?: string }) =>
    fetchWithAuth<{ subject: Subject }>('/subjects', {
      method: 'POST',
      body: JSON.stringify(subjectData),
    }),
  updateSubject: (id: string, updates: Partial<Subject>) =>
    fetchWithAuth<{ subject: Subject }>(`/subjects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  deleteSubject: (id: string) =>
    fetchWithAuth<{ message: string }>(`/subjects/${id}`, {
      method: 'DELETE',
    }),

  // Planner
  generatePlan: (params: {
    startTime: string;
    endTime: string;
    sessionMinutes: number;
    breakMinutes: number;
    maxDailyHours: number;
    weights?: PriorityWeights;
  }) =>
    fetchWithAuth<{
      schedule: StudyScheduleSlot[];
      totalStudyMinutes: number;
      totalBreakMinutes: number;
      isOverloaded: boolean;
      overloadMinutes: number;
      advice: string;
    }>('/planner/generate', {
      method: 'POST',
      body: JSON.stringify(params),
    }),

  // Analytics
  getAnalytics: () =>
    fetchWithAuth<{
      metrics: {
        totalTasks: number;
        completedTasks: number;
        pendingTasks: number;
        overdueTasks: number;
        todayStudyHours: number;
        weeklyStudyHours: number;
        completionRate: number;
        onTimeRate: number;
      };
      weeklyChartData: Array<{ day: string; hours: number }>;
      subjectChartData: Array<{ subject: string; total: number; completed: number; progress: number }>;
    }>('/analytics'),

  // Preferences & Achievements
  getPreferences: () => fetchWithAuth<{ preferences: StudyPreferences }>('/preferences'),
  updatePreferences: (prefs: Partial<StudyPreferences>) =>
    fetchWithAuth<{ preferences: StudyPreferences }>('/preferences', {
      method: 'PUT',
      body: JSON.stringify(prefs),
    }),
  getAchievements: () => fetchWithAuth<{ achievements: Achievement[] }>('/achievements'),

  // Seed Demo Data
  seedDemoData: () => fetchWithAuth<{ message: string; count: number }>('/seed', { method: 'POST' }),

  // AI Deep Dive Rationale
  explainTask: (taskId: string) =>
    fetchWithAuth<{
      taskId: string;
      score: number;
      aiExplanation: string;
      source: string;
    }>('/ai/explain', {
      method: 'POST',
      body: JSON.stringify({ taskId }),
    }),

  // Password Update
  changePassword: (passwords: { currentPassword: string; newPassword: string }) =>
    fetchWithAuth<{ message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(passwords),
    }),

  resetPassword: (payload: { email: string; newPassword: string }) =>
    fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');
      return data;
    }),
};
