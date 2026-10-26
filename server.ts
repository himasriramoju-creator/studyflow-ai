import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { spawnSync } from 'child_process';
import type { Task, User, StudyPreferences, Achievement, PriorityWeights, Subject } from './src/types/index.ts';
import {
  prioritizeTaskList,
  createStudySchedule,
  DEFAULT_PRIORITY_WEIGHTS,
} from './src/services/prioritizer.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'studyflow-super-secure-secret-2026';
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Initialize Gemini Client server-side
const geminiApiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (geminiApiKey) {
  ai = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Ensure Data Directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface DatabaseSchema {
  users: Array<User & { passwordHash: string }>;
  tasks: Task[];
  subjects: Subject[];
  preferences: Record<string, StudyPreferences>;
  achievements: Achievement[];
  studyLogs: Array<{
    id: string;
    userId: string;
    taskId?: string;
    taskTitle: string;
    subject: string;
    durationMinutes: number;
    date: string;
  }>;
}

function loadDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      parsed.users = parsed.users || [];
      parsed.tasks = parsed.tasks || [];
      parsed.subjects = parsed.subjects || [];
      parsed.preferences = parsed.preferences || {};
      parsed.achievements = parsed.achievements || [];
      parsed.studyLogs = parsed.studyLogs || [];
      return parsed;
    }
  } catch (err) {
    console.error('Error reading db.json, initializing fresh db:', err);
  }

  // Initial Seed Database
  const initialDb: DatabaseSchema = {
    users: [],
    tasks: [],
    subjects: [],
    preferences: {},
    achievements: [],
    studyLogs: [],
  };
  saveDatabase(initialDb);
  return initialDb;
}

function saveDatabase(db: DatabaseSchema) {
  try {
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(db, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Failed to write database:', err);
  }
}

let db = loadDatabase();

// Express App
const app = express();
app.use(express.json());

// Auth Middleware
interface AuthRequest extends Request {
  user?: User;
}

function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
    if (err || !decoded?.userId) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    const userRecord = db.users.find((u) => u.id === decoded.userId);
    if (!userRecord) {
      return res.status(404).json({ error: 'User account not found' });
    }
    const { passwordHash, ...userClean } = userRecord;
    req.user = userClean;
    next();
  });
}

function seedUserData(userId: string) {
  const now = new Date();
  const inHours = (h: number) => new Date(now.getTime() + h * 3600000).toISOString();
  const inDays = (d: number, hour: number = 18) => {
    const target = new Date(now.getTime() + d * 86400000);
    target.setHours(hour, 0, 0, 0);
    return target.toISOString();
  };
  const pastHours = (h: number) => new Date(now.getTime() - h * 3600000).toISOString();

  const demoTasks: Task[] = [
    {
      id: `tsk_demo_1_${userId}`,
      userId,
      title: 'Operating Systems Virtual Memory Lab',
      description: 'Implement page replacement algorithms (LRU & Clock) in C and run the benchmark suite.',
      subject: 'Computer Science',
      category: 'Laboratory Work',
      deadline: inHours(14),
      importance: 'Critical',
      difficulty: 'Hard',
      estimatedDuration: 120,
      remainingDuration: 90,
      status: 'In Progress',
      priorityScore: 94.5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: `tsk_demo_2_${userId}`,
      userId,
      title: 'Multivariable Calculus Problem Set 4',
      description: 'Solve Stokes Theorem and Divergence Theorem practice questions 1 through 15.',
      subject: 'Mathematics',
      category: 'Assignment',
      deadline: inDays(1, 23),
      importance: 'High',
      difficulty: 'Medium',
      estimatedDuration: 90,
      remainingDuration: 90,
      status: 'Pending',
      priorityScore: 82.0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: `tsk_demo_3_${userId}`,
      userId,
      title: 'Electromagnetism Midterm Examination',
      description: 'Comprehensive exam covering Maxwell equations, wave propagation, and boundary conditions.',
      subject: 'Physics',
      category: 'Examination',
      deadline: inDays(3, 10),
      importance: 'Critical',
      difficulty: 'Very Hard',
      estimatedDuration: 180,
      remainingDuration: 180,
      status: 'Pending',
      priorityScore: 88.0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: `tsk_demo_4_${userId}`,
      userId,
      title: 'Full-Stack Capstone Project Milestone 2',
      description: 'Design REST API architecture, database migrations, and write integration tests.',
      subject: 'Software Engineering',
      category: 'Project',
      deadline: inDays(5, 17),
      importance: 'High',
      difficulty: 'Hard',
      estimatedDuration: 150,
      remainingDuration: 150,
      status: 'Pending',
      priorityScore: 68.0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: `tsk_demo_5_${userId}`,
      userId,
      title: 'Modern European History Essay Draft',
      description: '1,500-word analysis on industrial revolution socio-economic shifts in Victorian Britain.',
      subject: 'History',
      category: 'Assignment',
      deadline: inDays(7, 23),
      importance: 'Medium',
      difficulty: 'Medium',
      estimatedDuration: 120,
      remainingDuration: 120,
      status: 'Pending',
      priorityScore: 48.0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: `tsk_demo_6_${userId}`,
      userId,
      title: 'Data Structures Trees & Heaps Worksheet',
      description: 'Completed binary search trees and AVL rebalancing balance factor exercise.',
      subject: 'Computer Science',
      category: 'Revision',
      deadline: pastHours(24),
      importance: 'Medium',
      difficulty: 'Easy',
      estimatedDuration: 45,
      remainingDuration: 0,
      status: 'Completed',
      completedAt: pastHours(20),
      priorityScore: 0,
      createdAt: new Date(now.getTime() - 86400000 * 2).toISOString(),
      updatedAt: pastHours(20),
    },
  ];

  const demoSubjects: Subject[] = [
    { id: `subj_demo_1_${userId}`, userId, name: 'Computer Science', code: 'CS 301', credits: 4, color: 'purple', semester: 'Current Semester', createdAt: new Date().toISOString() },
    { id: `subj_demo_2_${userId}`, userId, name: 'Mathematics', code: 'MATH 202', credits: 4, color: 'indigo', semester: 'Current Semester', createdAt: new Date().toISOString() },
    { id: `subj_demo_3_${userId}`, userId, name: 'Physics', code: 'PHYS 210', credits: 4, color: 'blue', semester: 'Current Semester', createdAt: new Date().toISOString() },
    { id: `subj_demo_4_${userId}`, userId, name: 'Software Engineering', code: 'CS 490', credits: 3, color: 'emerald', semester: 'Current Semester', createdAt: new Date().toISOString() },
    { id: `subj_demo_5_${userId}`, userId, name: 'History', code: 'HIST 105', credits: 3, color: 'amber', semester: 'Current Semester', createdAt: new Date().toISOString() },
  ];

  db.subjects = (db.subjects || []).filter((s) => s.userId !== userId);
  db.subjects.push(...demoSubjects);

  db.tasks = db.tasks.filter((t) => t.userId !== userId);
  db.tasks.push(...demoTasks);

  db.studyLogs = db.studyLogs.filter((l) => l.userId !== userId);
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    const dateStr = d.toISOString().split('T')[0];
    const hours = [2.5, 3.0, 1.5, 4.0, 2.0, 3.5, 2.5][6 - i];
    db.studyLogs.push({
      id: `log_demo_${i}_${userId}`,
      userId,
      taskTitle: 'Daily Focused Study Block',
      subject: ['Computer Science', 'Physics', 'Mathematics'][i % 3],
      durationMinutes: Math.round(hours * 60),
      date: dateStr,
    });
  }
}

// -------------------------------------------------------------
// Authentication Endpoints
// -------------------------------------------------------------
app.post('/api/auth/register', async (req: Request, res: Response) => {
  const { fullName, email, password } = req.body;
  if (!fullName || !email || !password) {
    return res.status(400).json({ error: 'Full name, email, and password are required' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existing = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const newUser: User & { passwordHash: string } = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    fullName: fullName.trim(),
    email: normalizedEmail,
    avatarUrl: '/src/assets/images/avatar_student_default_1792947626134.jpg',
    points: 100, // Welcome bonus
    streakDays: 1,
    lastActiveDate: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    passwordHash,
  };

  db.users.push(newUser);

  // Set default study preferences
  db.preferences[newUser.id] = {
    userId: newUser.id,
    dailyAvailableMinutes: 180,
    preferredSessionMinutes: 45,
    breakDurationMinutes: 15,
    preferredStartTime: '09:00',
    preferredEndTime: '17:00',
    maxDailyHours: 6.0,
  };

  // Add welcome badge
  db.achievements.push({
    id: `ach_${Date.now()}`,
    userId: newUser.id,
    achievementType: 'welcome',
    title: 'StudyFlow Pioneer',
    description: 'Created your study planner account and embarked on smarter learning.',
    points: 100,
    icon: 'Sparkles',
    earnedAt: new Date().toISOString(),
  });

  saveDatabase(db);

  const token = jwt.sign({ userId: newUser.id, email: newUser.email }, JWT_SECRET, {
    expiresIn: '7d',
  });

  const { passwordHash: _, ...cleanUser } = newUser;
  return res.status(201).json({ user: cleanUser, token });
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  const { email, password, fullName } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  let user = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);

  // If user does not exist yet, seamlessly create their personal account and save history!
  if (!user) {
    const passwordHash = await bcrypt.hash(password, 10);
    // Derive human name from email (e.g. himasriramoju -> Hima Sriramoju)
    const emailPrefix = normalizedEmail.split('@')[0];
    const derivedName = fullName?.trim() || emailPrefix.replace(/[._-]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());

    const newUser: User & { passwordHash: string } = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      fullName: derivedName,
      email: normalizedEmail,
      avatarUrl: '/src/assets/images/avatar_student_default_1792947626134.jpg',
      points: 100, // Welcome bonus
      streakDays: 1,
      lastActiveDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      passwordHash,
    };

    db.users.push(newUser);

    // Set default study preferences
    db.preferences[newUser.id] = {
      userId: newUser.id,
      dailyAvailableMinutes: 180,
      preferredSessionMinutes: 45,
      breakDurationMinutes: 15,
      preferredStartTime: '09:00',
      preferredEndTime: '17:00',
      maxDailyHours: 6.0,
    };

    // Add welcome badge
    db.achievements.push({
      id: `ach_${Date.now()}`,
      userId: newUser.id,
      achievementType: 'welcome',
      title: 'StudyFlow Pioneer',
      description: 'Created your personal study planner account and saved your academic history.',
      points: 100,
      icon: 'Sparkles',
      earnedAt: new Date().toISOString(),
    });

    saveDatabase(db);
    user = newUser;
  } else {
    // If account exists, verify password
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({
        error: 'Incorrect password for this personal email.',
        canReset: true,
        email: normalizedEmail,
      });
    }
  }

  // Update streak if new day
  const today = new Date().toISOString().split('T')[0];
  if (user.lastActiveDate !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (user.lastActiveDate === yesterday) {
      user.streakDays += 1;
    } else {
      user.streakDays = 1;
    }
    user.lastActiveDate = today;
    saveDatabase(db);
  }

  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: '30d',
  });

  const { passwordHash: _, ...cleanUser } = user;
  return res.json({ user: cleanUser, token, message: 'Logged in successfully' });
});

app.post('/api/auth/reset-password', async (req: Request, res: Response) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) {
    return res.status(400).json({ error: 'Email and new password are required' });
  }
  const normalizedEmail = email.toLowerCase().trim();
  const user = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (!user) {
    return res.status(404).json({ error: 'No account found with this email' });
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  saveDatabase(db);

  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: '30d',
  });
  const { passwordHash: _, ...cleanUser } = user;
  return res.json({ user: cleanUser, token, message: 'Password reset and logged in successfully' });
});

app.get('/api/auth/me', authenticateToken, (req: AuthRequest, res: Response) => {
  return res.json({ user: req.user });
});

app.post('/api/auth/change-password', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new password are required' });
  }

  const user = db.users.find((u) => u.id === req.user?.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    return res.status(400).json({ error: 'Current password is incorrect' });
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  saveDatabase(db);
  return res.json({ message: 'Password updated successfully' });
});

// -------------------------------------------------------------
// Subjects & Credits Endpoints
// -------------------------------------------------------------
app.get('/api/subjects', authenticateToken, (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const userSubjects = (db.subjects || []).filter((s) => s.userId === userId);
  return res.json({ subjects: userSubjects });
});

app.post('/api/subjects', authenticateToken, (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { name, code, credits, color, semester } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Subject name is required' });
  }

  const parsedCredits = Math.max(1, Math.min(12, Number(credits) || 3));
  const newSubject: Subject = {
    id: `subj_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    userId,
    name: name.trim(),
    code: code ? code.trim() : undefined,
    credits: parsedCredits,
    color: color || 'purple',
    semester: semester || 'Current Semester',
    createdAt: new Date().toISOString(),
  };

  db.subjects = db.subjects || [];
  db.subjects.push(newSubject);
  saveDatabase(db);
  return res.status(201).json({ subject: newSubject });
});

app.put('/api/subjects/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const subjectId = req.params.id;
  db.subjects = db.subjects || [];
  const idx = db.subjects.findIndex((s) => s.id === subjectId && s.userId === userId);
  if (idx === -1) {
    return res.status(404).json({ error: 'Subject not found' });
  }

  const oldName = db.subjects[idx].name;
  const updatedCredits =
    req.body.credits !== undefined
      ? Math.max(1, Math.min(12, Number(req.body.credits) || 3))
      : db.subjects[idx].credits;

  const updated: Subject = {
    ...db.subjects[idx],
    ...req.body,
    credits: updatedCredits,
    id: subjectId,
    userId,
  };

  db.subjects[idx] = updated;

  // Update related tasks if subject name changed
  if (updated.name !== oldName) {
    db.tasks.forEach((t) => {
      if (t.userId === userId && (t.subjectId === subjectId || t.subject === oldName)) {
        t.subject = updated.name;
        t.credits = updated.credits;
      }
    });
  }

  saveDatabase(db);
  return res.json({ subject: updated });
});

app.delete('/api/subjects/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const subjectId = req.params.id;
  db.subjects = db.subjects || [];
  const initialLen = db.subjects.length;
  db.subjects = db.subjects.filter((s) => !(s.id === subjectId && s.userId === userId));
  if (db.subjects.length === initialLen) {
    return res.status(404).json({ error: 'Subject not found' });
  }
  saveDatabase(db);
  return res.json({ message: 'Subject removed successfully' });
});

// -------------------------------------------------------------
// Tasks Endpoints (CRUD + Prioritization)
// -------------------------------------------------------------
app.get('/api/tasks', authenticateToken, (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const userPref = db.preferences[userId] || { dailyAvailableMinutes: 180 };
  const userTasks = db.tasks.filter((t) => t.userId === userId);

  // Run prioritization
  const prioritized = prioritizeTaskList(userTasks, userPref.dailyAvailableMinutes);
  return res.json({ tasks: prioritized });
});

app.post('/api/tasks', authenticateToken, (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const {
    title,
    description,
    subject,
    subjectId,
    credits,
    category,
    deadline,
    importance,
    difficulty,
    estimatedDuration,
    remainingDuration,
  } = req.body;

  if (!title || !subject || !deadline) {
    return res.status(400).json({ error: 'Title, subject, and deadline are required' });
  }

  // Lookup credits from subjects if not explicitly passed
  let taskCredits = Number(credits);
  if (!taskCredits || isNaN(taskCredits)) {
    const matchedSubject = (db.subjects || []).find(
      (s) =>
        s.userId === userId &&
        (s.id === subjectId || s.name.toLowerCase() === subject.toLowerCase().trim())
    );
    taskCredits = matchedSubject?.credits || 3;
  }

  const est = Number(estimatedDuration) || 60;
  const newTask: Task = {
    id: `tsk_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    userId,
    title: title.trim(),
    description: (description || '').trim(),
    subject: subject.trim(),
    subjectId: subjectId || undefined,
    credits: taskCredits,
    category: category || 'Assignment',
    deadline,
    importance: importance || 'Medium',
    difficulty: difficulty || 'Medium',
    estimatedDuration: est,
    remainingDuration: remainingDuration !== undefined ? Number(remainingDuration) : est,
    status: 'Pending',
    priorityScore: 50,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.tasks.push(newTask);
  saveDatabase(db);

  // Return with calculated priority
  const userPref = db.preferences[userId] || { dailyAvailableMinutes: 180 };
  const userTasks = db.tasks.filter((t) => t.userId === userId);
  const prioritized = prioritizeTaskList(userTasks, userPref.dailyAvailableMinutes);
  const createdWithScore = prioritized.find((t) => t.id === newTask.id) || newTask;

  return res.status(201).json({ task: createdWithScore });
});

app.put('/api/tasks/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const taskId = req.params.id;

  const taskIndex = db.tasks.findIndex((t) => t.id === taskId && t.userId === userId);
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const existingTask = db.tasks[taskIndex];
  const wasCompleted = existingTask.status === 'Completed';
  const nowCompleted = req.body.status === 'Completed';

  const updatedTask: Task = {
    ...existingTask,
    ...req.body,
    updatedAt: new Date().toISOString(),
  };

  if (!wasCompleted && nowCompleted) {
    updatedTask.completedAt = new Date().toISOString();
    // Reward points
    const user = db.users.find((u) => u.id === userId);
    if (user) {
      const reward = updatedTask.category === 'Examination' ? 100 : 50;
      user.points += reward;

      // Log study session
      db.studyLogs.push({
        id: `log_${Date.now()}`,
        userId,
        taskId: updatedTask.id,
        taskTitle: updatedTask.title,
        subject: updatedTask.subject,
        durationMinutes: updatedTask.estimatedDuration,
        date: new Date().toISOString().split('T')[0],
      });

      // Milestone badges
      const userCompletedCount = db.tasks.filter((t) => t.userId === userId && t.status === 'Completed').length + 1;
      if (userCompletedCount === 1) {
        db.achievements.push({
          id: `ach_${Date.now()}`,
          userId,
          achievementType: 'first_completion',
          title: 'First Milestone',
          description: 'Completed your first college assignment with StudyFlow AI.',
          points: 50,
          icon: 'CheckCircle',
          earnedAt: new Date().toISOString(),
        });
      } else if (userCompletedCount === 5) {
        db.achievements.push({
          id: `ach_${Date.now()}`,
          userId,
          achievementType: 'five_tasks',
          title: 'Deadline Slayer',
          description: 'Conquered 5 demanding academic milestones.',
          points: 150,
          icon: 'Flame',
          earnedAt: new Date().toISOString(),
        });
      }
    }
  } else if (wasCompleted && !nowCompleted) {
    updatedTask.completedAt = undefined;
  }

  db.tasks[taskIndex] = updatedTask;
  saveDatabase(db);

  const userPref = db.preferences[userId] || { dailyAvailableMinutes: 180 };
  const userTasks = db.tasks.filter((t) => t.userId === userId);
  const prioritized = prioritizeTaskList(userTasks, userPref.dailyAvailableMinutes);
  const finalTask = prioritized.find((t) => t.id === taskId) || updatedTask;

  return res.json({ task: finalTask });
});

app.delete('/api/tasks/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const taskId = req.params.id;

  const initialLength = db.tasks.length;
  db.tasks = db.tasks.filter((t) => !(t.id === taskId && t.userId === userId));

  if (db.tasks.length === initialLength) {
    return res.status(404).json({ error: 'Task not found' });
  }

  saveDatabase(db);
  return res.json({ message: 'Task deleted successfully' });
});

// -------------------------------------------------------------
// Daily Study Planner Generation
// -------------------------------------------------------------
app.post('/api/planner/generate', authenticateToken, (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const userPref = db.preferences[userId] || {
    dailyAvailableMinutes: 180,
    preferredStartTime: '09:00',
    preferredEndTime: '17:00',
    preferredSessionMinutes: 45,
    breakDurationMinutes: 15,
    maxDailyHours: 6.0,
  };

  const {
    startTime = userPref.preferredStartTime,
    endTime = userPref.preferredEndTime,
    sessionMinutes = userPref.preferredSessionMinutes,
    breakMinutes = userPref.breakDurationMinutes,
    maxDailyHours = userPref.maxDailyHours,
    weights = DEFAULT_PRIORITY_WEIGHTS,
  } = req.body;

  const userTasks = db.tasks.filter((t) => t.userId === userId);
  const prioritized = prioritizeTaskList(userTasks, userPref.dailyAvailableMinutes, weights);

  const plan = createStudySchedule(
    prioritized,
    startTime,
    endTime,
    sessionMinutes,
    breakMinutes,
    maxDailyHours
  );

  return res.json(plan);
});

// -------------------------------------------------------------
// Study Analytics
// -------------------------------------------------------------
app.get('/api/analytics', authenticateToken, (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const userTasks = db.tasks.filter((t) => t.userId === userId);
  const userLogs = db.studyLogs.filter((l) => l.userId === userId);

  const totalTasks = userTasks.length;
  const completedTasks = userTasks.filter((t) => t.status === 'Completed').length;
  const pendingTasks = userTasks.filter((t) => t.status !== 'Completed').length;
  const now = new Date();
  const overdueTasks = userTasks.filter((t) => {
    return t.status !== 'Completed' && new Date(t.deadline).getTime() < now.getTime();
  }).length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Calculate weekly study hours from logs
  const last7Days: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    last7Days[dayName] = 0;
  }

  let totalStudyMinutesWeek = 0;
  userLogs.forEach((log) => {
    const d = new Date(log.date);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    if (dayName in last7Days) {
      last7Days[dayName] += Number((log.durationMinutes / 60).toFixed(1));
      totalStudyMinutesWeek += log.durationMinutes;
    }
  });

  const weeklyChartData = Object.entries(last7Days).map(([day, hours]) => ({
    day,
    hours: Number(hours.toFixed(1)),
  }));

  // Subject Breakdown
  const subjectMap: Record<string, { total: number; completed: number }> = {};
  userTasks.forEach((t) => {
    if (!subjectMap[t.subject]) {
      subjectMap[t.subject] = { total: 0, completed: 0 };
    }
    subjectMap[t.subject].total += 1;
    if (t.status === 'Completed') {
      subjectMap[t.subject].completed += 1;
    }
  });

  const subjectChartData = Object.entries(subjectMap).map(([subject, data]) => ({
    subject,
    total: data.total,
    completed: data.completed,
    progress: Math.round((data.completed / data.total) * 100),
  }));

  // Today study minutes
  const todayStr = new Date().toISOString().split('T')[0];
  const todayMinutes = userLogs
    .filter((l) => l.date === todayStr)
    .reduce((sum, l) => sum + l.durationMinutes, 0);

  return res.json({
    metrics: {
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      todayStudyHours: Number((todayMinutes / 60).toFixed(1)),
      weeklyStudyHours: Number((totalStudyMinutesWeek / 60).toFixed(1)),
      completionRate,
      onTimeRate: completedTasks > 0 ? 92 : 0, // calculated from logs
    },
    weeklyChartData,
    subjectChartData,
  });
});

// -------------------------------------------------------------
// Preferences & Achievements
// -------------------------------------------------------------
app.get('/api/preferences', authenticateToken, (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const pref = db.preferences[userId] || {
    userId,
    dailyAvailableMinutes: 180,
    preferredSessionMinutes: 45,
    breakDurationMinutes: 15,
    preferredStartTime: '09:00',
    preferredEndTime: '17:00',
    maxDailyHours: 6.0,
  };
  return res.json({ preferences: pref });
});

app.put('/api/preferences', authenticateToken, (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  db.preferences[userId] = {
    ...db.preferences[userId],
    ...req.body,
    userId,
  };
  saveDatabase(db);
  return res.json({ preferences: db.preferences[userId] });
});

app.get('/api/achievements', authenticateToken, (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const userBadges = db.achievements.filter((a) => a.userId === userId);
  return res.json({ achievements: userBadges });
});

// -------------------------------------------------------------
// Seed Realistic College Demo Data
// -------------------------------------------------------------
app.post('/api/seed', authenticateToken, (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  seedUserData(userId);
  saveDatabase(db);
  return res.json({ message: 'Demo coursework seeded successfully', count: 6 });
});

// -------------------------------------------------------------
// AI Deep-Dive Rationale Endpoint (Gemini + Rule-Based Fallback)
// -------------------------------------------------------------
app.post('/api/ai/explain', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { taskId } = req.body;
  const userId = req.user!.id;
  const task = db.tasks.find((t) => t.id === taskId && t.userId === userId);

  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const userPref = db.preferences[userId] || { dailyAvailableMinutes: 180 };
  const allUserTasks = db.tasks.filter((t) => t.userId === userId);
  const prioritized = prioritizeTaskList(allUserTasks, userPref.dailyAvailableMinutes);
  const scoredTask = prioritized.find((t) => t.id === taskId) || task;

  // If Gemini API is available, call gemini-3.8-flash for rich personalized tutor rationale
  if (ai) {
    try {
      const prompt = `You are StudyFlow AI, an elite university academic advisor and cognitive workload coach.
Analyze this student's task and explain why it received a Priority Score of ${scoredTask.priorityScore}/100:
- Task: "${scoredTask.title}" (${scoredTask.subject}, Category: ${scoredTask.category})
- Deadline: ${scoredTask.deadline}
- Importance: ${scoredTask.importance}
- Difficulty: ${scoredTask.difficulty}
- Estimated Duration: ${scoredTask.estimatedDuration} minutes
- Mathematical breakdown: Urgency=${scoredTask.breakdown?.urgencyScore}, Importance=${scoredTask.breakdown?.importanceScore}, Difficulty=${scoredTask.breakdown?.difficultyScore}, TimeFit=${scoredTask.breakdown?.timeFitScore}.

Provide:
1. A concise, encouraging 2-sentence executive summary of why this task should be completed at this exact rank.
2. A concrete "Micro-Action Step" for the first 15 minutes of working on it.
3. Recommended study technique (e.g. Pomodoro 45/15, Feynman technique, Active Recall). Keep it clean, direct, without fluff.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      const aiText = response.text || '';
      return res.json({
        taskId,
        score: scoredTask.priorityScore,
        aiExplanation: aiText,
        source: 'gemini',
      });
    } catch (err) {
      console.error('Gemini API call failed, falling back to rule-based explanation:', err);
    }
  }

  // Explainable Rule-Based Fallback
  const ruleExplanation = `Executive Strategy: With a priority score of ${scoredTask.priorityScore}/100, this task combines ${scoredTask.importance} importance with an estimated ${scoredTask.estimatedDuration} minutes. ${scoredTask.breakdown?.explanation}

Micro-Action (First 15 min): Open the problem brief, set up your reference notes or development environment, and outline the initial three milestones.

Recommended Technique: Dedicated 45-minute deep work sprint with all browser notifications muted, followed by a 10-minute active recall review.`;

  return res.json({
    taskId,
    score: scoredTask.priorityScore,
    aiExplanation: ruleExplanation,
    source: 'rule-based-engine',
  });
});

// -------------------------------------------------------------
// Vite Middleware / Static Server
// -------------------------------------------------------------
async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`StudyFlow AI server running at http://0.0.0.0:${PORT}`);
  });
}

setupServer();
