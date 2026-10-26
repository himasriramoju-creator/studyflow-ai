import React, { useState, useEffect } from 'react';
import {
  Search,
  Sliders,
  Plus,
  Filter,
  ArrowUpDown,
  BookOpen,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Task, TaskCategory, ImportanceLevel, PriorityWeights, Subject } from '../types';
import { api } from '../services/api';
import { TaskCard } from '../components/TaskCard';
import { DEFAULT_PRIORITY_WEIGHTS } from '../services/prioritizer';

interface TasksPageProps {
  onOpenAddTask: () => void;
  onEditTask: (task: Task) => void;
  onOpenExplain: (task: Task) => void;
  onOpenWeights: () => void;
  onOpenAddSubject?: () => void;
  subjects?: Subject[];
  weights: PriorityWeights;
}

export const TasksPage: React.FC<TasksPageProps> = ({
  onOpenAddTask,
  onEditTask,
  onOpenExplain,
  onOpenWeights,
  onOpenAddSubject,
  subjects = [],
  weights,
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedImportance, setSelectedImportance] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'priority' | 'deadline' | 'duration' | 'difficulty'>('priority');

  const loadTasks = async () => {
    try {
      setLoading(true);
      const res = await api.getTasks();
      setTasks(res.tasks);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [weights]);

  const handleToggleComplete = async (task: Task) => {
    const nextStatus = task.status === 'Completed' ? 'In Progress' : 'Completed';
    try {
      await api.updateTask(task.id, { status: nextStatus });
      await loadTasks();
    } catch (err) {
      console.error('Failed to toggle completion:', err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.deleteTask(taskId);
      await loadTasks();
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  // Filter & Search logic
  const now = new Date().getTime();
  const filtered = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === 'All' || task.subject === selectedSubject || task.subjectId === selectedSubject;
    const matchesCategory = selectedCategory === 'All' || task.category === selectedCategory;
    const matchesImportance = selectedImportance === 'All' || task.importance === selectedImportance;

    let matchesStatus = true;
    if (selectedStatus === 'Completed') matchesStatus = task.status === 'Completed';
    else if (selectedStatus === 'Pending') matchesStatus = task.status !== 'Completed';
    else if (selectedStatus === 'Overdue') {
      matchesStatus = task.status !== 'Completed' && new Date(task.deadline).getTime() < now;
    }

    return matchesSearch && matchesSubject && matchesCategory && matchesImportance && matchesStatus;
  });

  // Sort logic
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'priority') {
      return b.priorityScore - a.priorityScore;
    } else if (sortBy === 'deadline') {
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    } else if (sortBy === 'duration') {
      return b.estimatedDuration - a.estimatedDuration;
    } else {
      // difficulty
      const diffMap: Record<string, number> = { Easy: 1, Medium: 2, Hard: 3, 'Very Hard': 4 };
      return (diffMap[b.difficulty] || 0) - (diffMap[a.difficulty] || 0);
    }
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Task Management</h1>
          <p className="text-xs text-slate-500">
            Search, organize, and filter all academic milestones and study assignments.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenWeights}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Adjust algorithm weights for Urgency, Importance, Difficulty, and Time Fit"
          >
            <Sliders className="w-3.5 h-3.5 text-purple-600" />
            <span>Algorithm Weights ({Math.round(weights.urgency * 100)}/{Math.round(weights.importance * 100)}/{Math.round(weights.difficulty * 100)}/{Math.round(weights.timeFit * 100)})</span>
          </button>

          <button
            onClick={onOpenAddTask}
            className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-lg shadow-xs hover:shadow transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks by title, code, or subject..."
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" />
              Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
            >
              <option value="priority">Priority Score (Highest first)</option>
              <option value="deadline">Deadline Proximity (Soonest)</option>
              <option value="duration">Estimated Duration (Longest)</option>
              <option value="difficulty">Difficulty (Hardest first)</option>
            </select>
          </div>
        </div>

        {/* Filter Pills / Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1 text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* Subject Filter (from enrolled semester subjects) */}
          {subjects.length > 0 && (
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-700 font-medium"
            >
              <option value="All">All Subjects ({subjects.length})</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name} ({s.credits} cr)
                </option>
              ))}
            </select>
          )}

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-700"
          >
            <option value="All">All Categories</option>
            <option value="Assignment">Assignment</option>
            <option value="Examination">Examination</option>
            <option value="Project">Project</option>
            <option value="Revision">Revision</option>
            <option value="Laboratory Work">Laboratory Work</option>
            <option value="Personal Study">Personal Study</option>
          </select>

          {/* Importance Filter */}
          <select
            value={selectedImportance}
            onChange={(e) => setSelectedImportance(e.target.value)}
            className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-700"
          >
            <option value="All">All Importance</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-700"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending / In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Overdue">Overdue</option>
          </select>

          {(searchQuery ||
            selectedSubject !== 'All' ||
            selectedCategory !== 'All' ||
            selectedImportance !== 'All' ||
            selectedStatus !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedSubject('All');
                setSelectedCategory('All');
                setSelectedImportance('All');
                setSelectedStatus('All');
              }}
              className="text-purple-600 hover:text-purple-800 font-medium ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Task List Rendering */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-28 bg-white rounded-xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No matching tasks found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query or filter tags, or add a new task to your schedule.
          </p>
          <button
            onClick={onOpenAddTask}
            className="mt-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            Create New Task
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((task) => (
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
  );
};
