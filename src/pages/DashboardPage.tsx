import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  Flame,
  Award,
  Plus,
  Play,
  RotateCcw,
  ArrowRight,
  TrendingUp,
  Brain,
  Layers,
  BookOpen,
  Coffee,
  ChevronRight,
  Sliders,
  Check,
  Target,
  BarChart2,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Task, StudyScheduleSlot, Subject } from '../types';
import { api } from '../services/api';
import { TaskCard } from '../components/TaskCard';
import { createStudySchedule } from '../services/prioritizer';

interface DashboardPageProps {
  onOpenAddTask: () => void;
  onEditTask: (task: Task) => void;
  onOpenExplain: (task: Task) => void;
  onStartFocus: (task: Task) => void;
  onNavigateTab: (tab: string) => void;
  subjects?: Subject[];
  onOpenAddSubject?: () => void;
  onOpenEditSubject?: (subj: Subject) => void;
  onRefreshSubjects?: () => Promise<void>;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onOpenAddTask,
  onEditTask,
  onOpenExplain,
  onStartFocus,
  onNavigateTab,
  subjects = [],
  onOpenAddSubject,
  onOpenEditSubject,
  onRefreshSubjects,
}) => {
  const { user, refreshUser } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [filterSubject, setFilterSubject] = useState<string>('All');
  const [todaySchedule, setTodaySchedule] = useState<StudyScheduleSlot[]>([]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.getTasks();
      setTasks(res.tasks);

      // Generate dynamic study schedule preview for today
      const scheduleRes = createStudySchedule(res.tasks, '09:00', '17:00', 45, 15, 6.0);
      setTodaySchedule(scheduleRes.schedule);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleToggleComplete = async (task: Task) => {
    const nextStatus = task.status === 'Completed' ? 'In Progress' : 'Completed';
    try {
      await api.updateTask(task.id, { status: nextStatus });
      await loadDashboardData();
      await refreshUser();
    } catch (err) {
      console.error('Failed to toggle completion:', err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.deleteTask(taskId);
      await loadDashboardData();
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const handleSeedData = async () => {
    try {
      setSeeding(true);
      await api.seedDemoData();
      await loadDashboardData();
      await refreshUser();
    } catch (err) {
      console.error('Seed error:', err);
    } finally {
      setSeeding(false);
    }
  };

  // Metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
  const pendingTasks = tasks.filter((t) => t.status !== 'Completed').length;
  const nowTime = new Date().getTime();
  const overdueTasks = tasks.filter(
    (t) => t.status !== 'Completed' && new Date(t.deadline).getTime() < nowTime
  ).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Active tasks sorted by priority
  const activeTasks = tasks.filter((t) => t.status !== 'Completed');
  const topTask = activeTasks.length > 0 ? activeTasks[0] : null;

  // Enrolled subjects & Filtered queue
  const filterSubjectOptions = subjects.length > 0
    ? ['All', ...subjects.map((s) => s.name)]
    : tasks.length > 0
    ? ['All', ...Array.from(new Set(tasks.map((t) => t.subject)))]
    : ['All'];

  const totalCredits = subjects.reduce((sum, s) => sum + (s.credits || 0), 0);

  const displayedTasks = tasks.filter((t) =>
    filterSubject === 'All' ? true : t.subject === filterSubject
  );

  // Time-aware greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Executive Welcome & Command Banner (Light theme, soft lavender aura, glassmorphic highlight) */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-50/90 via-white to-indigo-50/70 rounded-3xl p-6 sm:p-8 border border-purple-100/90 shadow-sm">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-gradient-to-br from-purple-200/30 to-indigo-200/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-700">
              <span className="bg-white/80 px-2.5 py-1 rounded-full border border-purple-200/60 shadow-2xs flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-purple-600" />
                <span>{formattedDate}</span>
              </span>
              <span className="bg-amber-50 text-amber-800 px-2.5 py-1 rounded-full border border-amber-200/60 shadow-2xs flex items-center gap-1.5 font-mono-numbers">
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>{user?.streakDays || 1}-Day Streak</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-snug">
              {greeting}, {user?.fullName || 'Student'}! 👋
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {topTask
                ? `You have ${pendingTasks} active coursework ${pendingTasks === 1 ? 'task' : 'tasks'} queued. Your highest priority milestone today is in ${topTask.subject}.`
                : 'All caught up! No overdue or pending coursework. You are maintaining optimal momentum.'}
            </p>
          </div>

          {/* Quick Action Controls */}
          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            <button
              onClick={handleSeedData}
              disabled={seeding}
              className="px-3.5 py-2.5 text-xs font-semibold text-slate-700 bg-white/90 hover:bg-white border border-slate-200 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Populate demo university assignments & exams"
            >
              <RotateCcw className={`w-3.5 h-3.5 text-purple-600 ${seeding ? 'animate-spin' : ''}`} />
              <span>{seeding ? 'Loading Coursework...' : 'Load Demo Coursework'}</span>
            </button>

            <button
              onClick={() => onNavigateTab('subjects')}
              className="px-3.5 py-2.5 text-xs font-semibold text-slate-700 bg-white/90 hover:bg-white border border-slate-200 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Manage enrolled semester subjects and credit hours"
            >
              <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
              <span>Subjects & Credits</span>
            </button>

            <button
              onClick={() => onNavigateTab('planner')}
              className="px-4 py-2.5 text-xs font-semibold text-purple-700 bg-purple-100/70 hover:bg-purple-100 border border-purple-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 text-purple-600" />
              <span>Study Timeline</span>
            </button>

            <button
              onClick={onOpenAddTask}
              className="px-4 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Task</span>
            </button>
          </div>
        </div>
      </div>

      {/* Enrolled Semester Subjects & Credits Ribbon */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900">Enrolled Semester Subjects</span>
              <span className="text-xs text-slate-500 ml-2">
                {subjects.length > 0 ? `(${subjects.length} courses · ${totalCredits} credits)` : '(Empty - enter courses below)'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTab('subjects')}
              className="text-xs font-medium text-slate-500 hover:text-purple-600 flex items-center gap-1 cursor-pointer"
            >
              <span>Manage All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            {onOpenAddSubject && (
              <button
                onClick={onOpenAddSubject}
                className="px-3 py-1 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Subject</span>
              </button>
            )}
          </div>
        </div>

        {subjects.length === 0 ? (
          <div className="p-4 bg-purple-50/50 rounded-xl border border-dashed border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
            <div className="space-y-0.5">
              <p className="font-semibold text-slate-800">No semester subjects registered yet</p>
              <p className="text-slate-500">Every student has unique coursework. Add your courses and assigned credit weights (1–12 cr) to power the intelligent prioritizer.</p>
            </div>
            {onOpenAddSubject && (
              <button
                onClick={onOpenAddSubject}
                className="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg text-xs font-bold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Enter Subjects & Credits</span>
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {subjects.map((subj) => (
              <div
                key={subj.id}
                onClick={() => setFilterSubject(filterSubject === subj.name ? 'All' : subj.name)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer border shrink-0 ${
                  filterSubject === subj.name
                    ? 'bg-purple-100 text-purple-900 border-purple-300 font-bold shadow-2xs'
                    : 'bg-slate-50 hover:bg-purple-50/60 text-slate-700 border-slate-200/80 font-medium'
                }`}
                title={`Filter queue by ${subj.name}`}
              >
                <span className="w-2 h-2 rounded-full bg-purple-600" />
                <span>{subj.name}</span>
                <span className="bg-white px-1.5 py-0.2 rounded text-[10px] font-bold text-purple-700 border border-purple-100 shadow-2xs font-mono-numbers">
                  {subj.credits} cr
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. 4 Clean Bento Metric Cards (High density, readable typography, tabular figures) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Pending & Urgency */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-purple-200 transition-colors">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
            <span>Coursework In Queue</span>
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <Layers className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono-numbers">
              {pendingTasks}
            </span>
            <span className="text-xs text-slate-400">active tasks</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] pt-2 border-t border-slate-100">
            <span className="text-slate-500">Overdue attention:</span>
            <span
              className={`font-semibold font-mono-numbers ${
                overdueTasks > 0 ? 'text-rose-600 font-bold' : 'text-emerald-600'
              }`}
            >
              {overdueTasks > 0 ? `${overdueTasks} Overdue` : '0 Overdue (Nominal)'}
            </span>
          </div>
        </div>

        {/* Metric 2: Completion Velocity */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-purple-200 transition-colors">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
            <span>Completion Velocity</span>
            <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600 font-mono-numbers">
              {completionRate}%
            </span>
            <span className="text-xs text-slate-400">milestones done</span>
          </div>
          {/* Visual Mini Progress Bar */}
          <div className="mt-3 space-y-1 pt-2 border-t border-slate-100">
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 font-mono-numbers">
              <span>{completedTasks} completed</span>
              <span>{totalTasks} total</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Daily Study Budget */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-purple-200 transition-colors">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
            <span>Target Daily Study</span>
            <span className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-purple-700 font-mono-numbers">
              3.5
            </span>
            <span className="text-xs text-slate-500 font-medium">hours allocated</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] pt-2 border-t border-slate-100">
            <span className="text-slate-500">Session cadence:</span>
            <span className="font-semibold text-purple-700">45m Sprint / 15m Break</span>
          </div>
        </div>

        {/* Metric 4: Academic Honors Points */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-purple-200 transition-colors">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
            <span>Academic Momentum</span>
            <span className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <Award className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono-numbers">
              {user?.points || 100}
            </span>
            <span className="text-xs text-slate-400 font-medium">points</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] pt-2 border-t border-slate-100">
            <span className="text-slate-500">Tier:</span>
            <span className="font-semibold text-slate-700 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Honors Scholar</span>
            </span>
          </div>
        </div>
      </div>

      {/* 3. Main Dashboard Body: 2-Column Command Center */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Hero Focus Card + Prioritized Queue */}
        <div className="lg:col-span-8 space-y-6">
          {/* Recommended Next Task Highlight (Light glassmorphic aesthetic with purple gradient accent) */}
          {topTask ? (
            <div className="relative overflow-hidden bg-white rounded-2xl border-2 border-purple-200/90 p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-600 text-white shadow-2xs">
                      <Sparkles className="w-3 h-3" />
                      Recommended Next Task
                    </span>
                    <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-200/70">
                      {topTask.subject}
                    </span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs text-slate-500">{topTask.category}</span>
                  </div>

                  <h2 className="text-xl font-bold text-slate-900 leading-tight">
                    {topTask.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {topTask.breakdown?.explanation ||
                      `Immediate focus recommended: combines ${topTask.importance} importance with near deadline.`}
                  </p>

                  {/* Micro Breakdown Metrics Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 text-center">
                      <div className="text-[10px] text-slate-400 font-medium">Urgency (40%)</div>
                      <div className="text-xs font-bold text-rose-600 font-mono-numbers">
                        {topTask.breakdown?.urgencyScore ?? 90} pts
                      </div>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 text-center">
                      <div className="text-[10px] text-slate-400 font-medium">Importance (30%)</div>
                      <div className="text-xs font-bold text-amber-600 font-mono-numbers">
                        {topTask.breakdown?.importanceScore ?? 75} pts
                      </div>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 text-center">
                      <div className="text-[10px] text-slate-400 font-medium">Difficulty (20%)</div>
                      <div className="text-xs font-bold text-indigo-600 font-mono-numbers">
                        {topTask.breakdown?.difficultyScore ?? 75} pts
                      </div>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 text-center">
                      <div className="text-[10px] text-slate-400 font-medium">Time Fit (10%)</div>
                      <div className="text-xs font-bold text-emerald-600 font-mono-numbers">
                        {topTask.breakdown?.timeFitScore ?? 85} pts
                      </div>
                    </div>
                  </div>
                </div>

                {/* Score Dial & Action Controls */}
                <div className="flex flex-col items-center sm:items-end gap-3 shrink-0 self-center sm:self-start">
                  {/* Score Pill */}
                  <div className="flex flex-col items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-50 via-white to-purple-100/60 border border-purple-200/80 shadow-2xs">
                    <span className="text-2xl font-black text-purple-700 font-mono-numbers">
                      {topTask.priorityScore}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Priority Rank
                    </span>
                  </div>

                  <button
                    onClick={() => onStartFocus(topTask)}
                    className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Launch Focus Sprint</span>
                  </button>

                  <button
                    onClick={() => onOpenExplain(topTask)}
                    className="text-xs font-medium text-purple-600 hover:text-purple-800 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Brain className="w-3.5 h-3.5" />
                    <span>Explain AI Formula</span>
                  </button>
                </div>
              </div>
            </div>
          ) : subjects.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-purple-200 p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto shadow-inner">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Step 1: Enter Your Semester Subjects & Credits</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Different college degrees have different course lists and credit hours. Add the courses you are enrolled in this semester and specify their credit weight to build your customized planner.
              </p>
              {onOpenAddSubject && (
                <button
                  onClick={onOpenAddSubject}
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Enter Semester Subjects & Credits</span>
                </button>
              )}
            </div>
          ) : tasks.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Step 2: Add Coursework Tasks</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                You have registered {subjects.length} semester {subjects.length === 1 ? 'subject' : 'subjects'}. Add your upcoming assignments, exams, and labs to see them prioritized automatically.
              </p>
              <button
                onClick={onOpenAddTask}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Your First Task</span>
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">All coursework completed!</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                You've cleared all current academic milestones across your courses. Click below to add new assignments.
              </p>
              <button
                onClick={onOpenAddTask}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Add Next Task
              </button>
            </div>
          )}

          {/* Today's Prioritized Task Queue */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Prioritized Academic Queue
                </h2>
                <p className="text-xs text-slate-500">
                  Tasks ordered by multi-factor score (Deadline Urgency, Importance, Difficulty, Time Fit).
                </p>
              </div>

              {/* Subject Tabs */}
              {filterSubjectOptions.length > 1 && (
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto max-w-full">
                  {filterSubjectOptions.slice(0, 6).map((subj) => (
                    <button
                      key={subj}
                      onClick={() => setFilterSubject(subj)}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                        filterSubject === subj
                          ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {subj}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-24 bg-slate-50 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : displayedTasks.length === 0 ? (
              <div className="py-10 text-center space-y-2">
                <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-semibold text-slate-600">
                  {filterSubject === 'All' ? 'No tasks queued yet' : `No tasks under "${filterSubject}"`}
                </p>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  {subjects.length === 0
                    ? 'Start by entering your semester subjects and assigning credits.'
                    : 'Click "New Task" to queue an assignment or exam for this course.'}
                </p>
                {subjects.length === 0 && onOpenAddSubject ? (
                  <button
                    onClick={onOpenAddSubject}
                    className="mt-2 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 px-3.5 py-1.5 rounded-lg border border-purple-200 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Enter Subjects & Credits</span>
                  </button>
                ) : (
                  <button
                    onClick={onOpenAddTask}
                    className="mt-2 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 px-3.5 py-1.5 rounded-lg border border-purple-200 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Task</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {displayedTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggleComplete={handleToggleComplete}
                    onEdit={onEditTask}
                    onDelete={handleDeleteTask}
                    onOpenExplain={onOpenExplain}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 cols): Today's Dynamic Timeline Preview & Consistency Widget */}
        <div className="lg:col-span-4 space-y-6">
          {/* Widget 1: Today's Generated Timeline Preview */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Today's Schedule</h3>
                  <p className="text-[11px] text-slate-500">Auto-balanced with rest breaks</p>
                </div>
              </div>

              <button
                onClick={() => onNavigateTab('planner')}
                className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-0.5 cursor-pointer"
              >
                <span>Full Plan</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {todaySchedule.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                No active tasks to schedule for today.
              </p>
            ) : (
              <div className="space-y-2.5">
                {todaySchedule.slice(0, 4).map((slot) => {
                  const isBreak = slot.type === 'break';
                  return (
                    <div
                      key={slot.id}
                      className={`p-3 rounded-xl border transition-all text-xs ${
                        isBreak
                          ? 'bg-emerald-50/50 border-emerald-100 text-emerald-900'
                          : 'bg-slate-50/70 border-slate-100 hover:border-purple-200 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-mono-numbers font-semibold">
                          {slot.startTime} – {slot.endTime}
                        </span>
                        {isBreak ? (
                          <span className="text-[10px] font-semibold text-emerald-700 flex items-center gap-1">
                            <Coffee className="w-3 h-3" />
                            {slot.durationMinutes}m Rest
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-100">
                            {slot.subject || 'Study'}
                          </span>
                        )}
                      </div>
                      <div className="font-semibold truncate">{slot.taskTitle}</div>
                    </div>
                  );
                })}

                {todaySchedule.length > 4 && (
                  <button
                    onClick={() => onNavigateTab('planner')}
                    className="w-full text-center py-1.5 text-xs text-slate-500 hover:text-purple-600 font-medium"
                  >
                    +{todaySchedule.length - 4} more scheduled study slots
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Widget 2: Weekly Study Consistency Strip */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Weekly Study Pulse</span>
              </h3>
              <button
                onClick={() => onNavigateTab('analytics')}
                className="text-xs text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-0.5"
              >
                <span>Analytics</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Mini Bar Activity Strip */}
            <div className="grid grid-cols-7 gap-1.5 text-center pt-1">
              {[
                { day: 'M', h: 3.5, active: true },
                { day: 'T', h: 4.0, active: true },
                { day: 'W', h: 2.5, active: true },
                { day: 'T', h: 3.0, active: true },
                { day: 'F', h: 4.5, active: true },
                { day: 'S', h: 1.5, active: true },
                { day: 'S', h: 3.0, active: true },
              ].map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="h-16 bg-slate-50 rounded-lg flex items-end p-1">
                    <div
                      className="w-full bg-gradient-to-t from-purple-600 to-indigo-500 rounded-md transition-all duration-300"
                      style={{ height: `${(item.h / 5.0) * 100}%` }}
                      title={`${item.h} hours`}
                    />
                  </div>
                  <div className="text-[10px] font-bold text-slate-500">{item.day}</div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
              <span>Weekly Total:</span>
              <span className="font-bold text-slate-900 font-mono-numbers">22.0 hrs logged</span>
            </div>
          </div>

          {/* Widget 3: Motivation & Next Milestone */}
          <div className="bg-gradient-to-br from-amber-50/80 via-white to-purple-50/50 rounded-2xl border border-amber-200/60 p-5 space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Next Unlock: Deadline Slayer</h4>
                <p className="text-[11px] text-slate-500">Complete 5 tasks (+150 pts)</p>
              </div>
            </div>
            <div className="w-full h-1.5 bg-amber-100/70 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full"
                style={{ width: `${Math.min(100, (completedTasks / 5) * 100)}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-500 flex justify-between">
              <span>{completedTasks} / 5 completed</span>
              <span className="text-amber-700 font-semibold font-mono-numbers">
                {Math.max(0, 5 - completedTasks)} to go
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
