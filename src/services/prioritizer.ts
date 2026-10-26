/**
 * StudyFlow AI - Prioritization Engine (TypeScript implementation matching Python backend)
 * Formula:
 * Priority Score = (0.40 * Urgency) + (0.30 * Importance) + (0.20 * Difficulty) + (0.10 * Time Fit)
 */

import type { Task, PriorityWeights, PriorityBreakdown, StudyScheduleSlot } from '../types/index.ts';

export const IMPORTANCE_VALUES: Record<string, number> = {
  Low: 25,
  Medium: 50,
  High: 75,
  Critical: 100,
};

export const DIFFICULTY_VALUES: Record<string, number> = {
  Easy: 25,
  Medium: 50,
  Hard: 75,
  'Very Hard': 100,
};

export const DEFAULT_PRIORITY_WEIGHTS: PriorityWeights = {
  urgency: 0.4,
  importance: 0.3,
  difficulty: 0.2,
  timeFit: 0.1,
};

export function calculateUrgency(deadlineIso: string, referenceTime: Date = new Date()): number {
  try {
    const deadline = new Date(deadlineIso);
    if (isNaN(deadline.getTime())) return 50;

    const diffMs = deadline.getTime() - referenceTime.getTime();
    const hoursLeft = diffMs / (1000 * 60 * 60);

    if (hoursLeft <= 0) {
      // Overdue: maximum urgency boost
      return 100;
    } else if (hoursLeft <= 12) {
      return 90 + (12 - hoursLeft) * (10 / 12);
    } else if (hoursLeft <= 24) {
      return 75 + (24 - hoursLeft) * (15 / 12);
    } else if (hoursLeft <= 72) {
      // Within 3 days
      return 50 + (72 - hoursLeft) * (25 / 48);
    } else if (hoursLeft <= 168) {
      // Within 7 days
      return 20 + (168 - hoursLeft) * (30 / 96);
    } else {
      // Beyond 7 days
      const score = 20 - Math.min(20, (hoursLeft - 168) / 24);
      return Math.max(5, score);
    }
  } catch {
    return 50;
  }
}

export function calculateTimeFit(estimatedMinutes: number, availableMinutes: number): number {
  if (availableMinutes <= 0 || estimatedMinutes <= 0) return 50;
  const ratio = estimatedMinutes / availableMinutes;

  if (ratio >= 0.4 && ratio <= 1.0) {
    // Fits very nicely in today's window
    return 100 - Math.abs(0.8 - ratio) * 40;
  } else if (ratio < 0.4) {
    // Quick win
    return 85;
  } else {
    // Exceeds available time; needs chunking
    const excessPenalty = Math.min(70, (ratio - 1.0) * 40);
    return Math.max(20, 100 - excessPenalty);
  }
}

export function computeTaskScore(
  task: Partial<Task>,
  availableDailyMinutes: number = 180,
  weights: PriorityWeights = DEFAULT_PRIORITY_WEIGHTS,
  referenceTime: Date = new Date()
): { priorityScore: number; breakdown: PriorityBreakdown } {
  const urgency = calculateUrgency(task.deadline || '', referenceTime);
  const baseImportance = IMPORTANCE_VALUES[task.importance || 'Medium'] ?? 50;
  // Factor in course credit weight (standard baseline is 3 credits; each credit adjusts importance)
  const creditWeight = task.credits ? 1 + ((task.credits - 3) * 0.05) : 1;
  const importance = Math.min(100, Math.max(10, baseImportance * creditWeight));

  const difficulty = DIFFICULTY_VALUES[task.difficulty || 'Medium'] ?? 50;
  const duration = task.remainingDuration || task.estimatedDuration || 60;
  const timeFit = calculateTimeFit(duration, availableDailyMinutes);

  const rawScore =
    weights.urgency * urgency +
    weights.importance * importance +
    weights.difficulty * difficulty +
    weights.timeFit * timeFit;

  const priorityScore = Number(Math.min(100, Math.max(0, rawScore)).toFixed(1));

  let urgencyDesc = 'Far deadline';
  if (urgency >= 90) urgencyDesc = 'Immediate deadline / overdue';
  else if (urgency >= 75) urgencyDesc = 'Deadline within 24h';
  else if (urgency >= 50) urgencyDesc = 'Approaching within 3 days';

  let fitDesc = 'Fits session';
  if (timeFit >= 80) fitDesc = 'Optimal single-session length';
  else if (timeFit < 50) fitDesc = 'Large workload (recommended to divide into chunks)';

  const creditNote = task.credits ? ` [${task.credits} credits]` : '';
  const explanation = `${urgencyDesc} (+${(weights.urgency * urgency).toFixed(1)} pts), ${
    task.importance || 'Medium'
  }${creditNote} importance (+${(weights.importance * importance).toFixed(1)} pts), ${
    task.difficulty || 'Medium'
  } difficulty (+${(weights.difficulty * difficulty).toFixed(1)} pts). ${fitDesc}.`;

  return {
    priorityScore,
    breakdown: {
      urgencyScore: Number(urgency.toFixed(1)),
      importanceScore: Number(importance.toFixed(1)),
      difficultyScore: Number(difficulty.toFixed(1)),
      timeFitScore: Number(timeFit.toFixed(1)),
      rawScore: priorityScore,
      explanation,
    },
  };
}

export function prioritizeTaskList(
  tasks: Task[],
  availableDailyMinutes: number = 180,
  weights: PriorityWeights = DEFAULT_PRIORITY_WEIGHTS
): Task[] {
  const active: Task[] = [];
  const completed: Task[] = [];

  for (const t of tasks) {
    if (t.status === 'Completed') {
      completed.push({
        ...t,
        priorityScore: 0,
      });
    } else {
      const { priorityScore, breakdown } = computeTaskScore(t, availableDailyMinutes, weights);
      active.push({
        ...t,
        priorityScore,
        breakdown,
      });
    }
  }

  active.sort((a, b) => {
    if (b.priorityScore !== a.priorityScore) {
      return b.priorityScore - a.priorityScore;
    }
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });

  return [...active, ...completed];
}

export function formatTimeMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  const period = h < 12 ? 'AM' : 'PM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  return `${String(displayH).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
}

export function parseTimeToMinutes(timeStr: string): number {
  const cleaned = timeStr.trim().toUpperCase();
  if (cleaned.includes('AM') || cleaned.includes('PM')) {
    const isPM = cleaned.includes('PM');
    const timeOnly = cleaned.replace(/[AP]M/, '').trim();
    const [h, m] = timeOnly.split(':').map(Number);
    let hour = h;
    if (isPM && hour < 12) hour += 12;
    if (!isPM && hour === 12) hour = 0;
    return hour * 60 + (m || 0);
  }
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function createStudySchedule(
  prioritizedTasks: Task[],
  startTime: string = '09:00',
  endTime: string = '17:00',
  preferredSessionMins: number = 45,
  breakDurationMins: number = 15,
  maxDailyHours: number = 6.0
): {
  schedule: StudyScheduleSlot[];
  totalStudyMinutes: number;
  totalBreakMinutes: number;
  isOverloaded: boolean;
  overloadMinutes: number;
  advice: string;
} {
  const startMin = parseTimeToMinutes(startTime);
  const endMin = parseTimeToMinutes(endTime);
  const totalWindowMins = Math.max(0, endMin - startMin);
  const maxAllowedMins = Math.floor(Math.min(totalWindowMins, maxDailyHours * 60));

  const slots: StudyScheduleSlot[] = [];
  let currentMin = startMin;
  let studyAllocated = 0;
  let breakAllocated = 0;

  const activeTasks = prioritizedTasks.filter((t) => t.status !== 'Completed');
  const totalDemand = activeTasks.reduce(
    (sum, t) => sum + (t.remainingDuration || t.estimatedDuration || 60),
    0
  );

  const isOverloaded = totalDemand > maxAllowedMins;
  const overloadMinutes = Math.max(0, totalDemand - maxAllowedMins);
  let slotCount = 1;

  for (const task of activeTasks) {
    if (currentMin >= endMin || studyAllocated >= maxAllowedMins) break;
    let remaining = task.remainingDuration || task.estimatedDuration || 60;

    while (remaining > 0 && currentMin < endMin && studyAllocated < maxAllowedMins) {
      const chunk = Math.min(remaining, preferredSessionMins);
      const availableRemaining = Math.min(endMin - currentMin, maxAllowedMins - studyAllocated);
      if (availableRemaining < 15) break;

      const duration = Math.min(chunk, availableRemaining);
      const slotStart = currentMin;
      const slotEnd = currentMin + duration;

      slots.push({
        id: `slot-${slotCount++}`,
        taskId: task.id,
        taskTitle: task.title,
        subject: task.subject,
        startTime: formatTimeMinutes(slotStart),
        endTime: formatTimeMinutes(slotEnd),
        startMinutes: slotStart,
        endMinutes: slotEnd,
        durationMinutes: duration,
        type: 'task',
        completed: false,
        priorityScore: task.priorityScore,
      });

      currentMin = slotEnd;
      studyAllocated += duration;
      remaining -= duration;

      // Break
      if (currentMin + breakDurationMins <= endMin && studyAllocated < maxAllowedMins) {
        const breakStart = currentMin;
        const breakEnd = currentMin + breakDurationMins;
        slots.push({
          id: `slot-${slotCount++}`,
          taskTitle: 'Brain Recharge Break',
          startTime: formatTimeMinutes(breakStart),
          endTime: formatTimeMinutes(breakEnd),
          startMinutes: breakStart,
          endMinutes: breakEnd,
          durationMinutes: breakDurationMins,
          type: 'break',
          completed: false,
        });
        currentMin = breakEnd;
        breakAllocated += breakDurationMins;
      }
    }
  }

  const hours = Math.floor(studyAllocated / 60);
  const mins = studyAllocated % 60;

  return {
    schedule: slots,
    totalStudyMinutes: studyAllocated,
    totalBreakMinutes: breakAllocated,
    isOverloaded,
    overloadMinutes,
    advice: isOverloaded
      ? `Notice: Your queued tasks (${Math.floor(totalDemand / 60)}h ${totalDemand % 60}m) exceed your ${Math.floor(
          maxAllowedMins / 60
        )}h target. High-priority tasks have been prioritized first; postpone lower urgency items.`
      : `Tailored plan ready! Scheduled ${hours}h ${mins}m of focused study with ${breakAllocated}m of brain breaks.`,
  };
}
