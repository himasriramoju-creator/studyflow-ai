import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  BookOpen,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Task } from '../types';

interface CalendarPageProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onOpenAddTask: () => void;
}

export const CalendarPage: React.FC<CalendarPageProps> = ({
  tasks,
  onSelectTask,
  onOpenAddTask,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  // Month calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Group tasks by "YYYY-MM-DD"
  const tasksByDate: Record<string, Task[]> = {};
  tasks.forEach((t) => {
    const d = new Date(t.deadline);
    if (!isNaN(d.getTime())) {
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate()
      ).padStart(2, '0')}`;
      if (!tasksByDate[key]) tasksByDate[key] = [];
      tasksByDate[key].push(t);
    }
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Examination':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Assignment':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Project':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Revision':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Laboratory Work':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  // Calendar cells builder
  const days = [];
  // Prev month padding
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    days.push({
      day: daysInPrevMonth - i,
      month: month - 1,
      year: month === 0 ? year - 1 : year,
      isCurrentMonth: false,
    });
  }
  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    days.push({
      day: d,
      month,
      year,
      isCurrentMonth: true,
    });
  }
  // Next month padding to complete 35 or 42 cells
  const remaining = (7 - (days.length % 7)) % 7;
  for (let d = 1; d <= remaining; d++) {
    days.push({
      day: d,
      month: month + 1,
      year: month === 11 ? year + 1 : year,
      isCurrentMonth: false,
    });
  }

  const todayStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(
    2,
    '0'
  )}-${String(new Date().getDate()).padStart(2, '0')}`;

  // Upcoming tasks sorted
  const upcomingDeadlines = [...tasks]
    .filter((t) => t.status !== 'Completed')
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 6);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Academic Calendar</h1>
          <p className="text-xs text-slate-500">
            View course assignments, test dates, and project milestones across your semester.
          </p>
        </div>

        {/* Month Navigation & Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white border border-slate-200 rounded-lg shadow-xs p-1">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-bold text-slate-800 min-w-32 text-center">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleToday}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-xs transition-colors"
          >
            Today
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Calendar Grid */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center py-2.5 text-xs font-bold text-slate-600">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
            {days.map((item, idx) => {
              const dateStr = `${item.year}-${String(item.month + 1).padStart(2, '0')}-${String(
                item.day
              ).padStart(2, '0')}`;
              const dayTasks = tasksByDate[dateStr] || [];
              const isToday = dateStr === todayStr;

              return (
                <div
                  key={idx}
                  className={`min-h-24 p-1.5 sm:p-2 flex flex-col justify-between transition-colors ${
                    !item.isCurrentMonth
                      ? 'bg-slate-50/40 text-slate-400'
                      : isToday
                      ? 'bg-purple-50/20'
                      : 'hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-semibold font-mono-numbers w-6 h-6 flex items-center justify-center rounded-full ${
                        isToday
                          ? 'bg-purple-600 text-white font-bold'
                          : item.isCurrentMonth
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {item.day}
                    </span>
                    {dayTasks.length > 0 && (
                      <span className="text-[10px] font-bold text-purple-600 font-mono-numbers">
                        {dayTasks.length} {dayTasks.length === 1 ? 'task' : 'tasks'}
                      </span>
                    )}
                  </div>

                  {/* Task Chips */}
                  <div className="space-y-1 overflow-hidden">
                    {dayTasks.slice(0, 3).map((t) => (
                      <button
                        key={t.id}
                        onClick={() => onSelectTask(t)}
                        className={`w-full text-left p-1 rounded-md text-[11px] font-medium truncate border transition-all cursor-pointer block ${getCategoryColor(
                          t.category
                        )} ${t.status === 'Completed' ? 'line-through opacity-60' : ''}`}
                        title={`${t.title} (${t.subject})`}
                      >
                        {t.title}
                      </button>
                    ))}
                    {dayTasks.length > 3 && (
                      <span className="text-[10px] text-slate-500 pl-1 block">
                        +{dayTasks.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar: Upcoming Deadlines & Categories Key */}
        <div className="lg:col-span-4 space-y-5">
          {/* Upcoming Deadlines Widget */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3.5">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-purple-600" />
              <span>Upcoming Deadlines</span>
            </h3>

            {upcomingDeadlines.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center">
                No pending deadlines in your calendar.
              </p>
            ) : (
              <div className="space-y-2.5">
                {upcomingDeadlines.map((t) => {
                  const d = new Date(t.deadline);
                  return (
                    <button
                      key={t.id}
                      onClick={() => onSelectTask(t)}
                      className="w-full text-left p-3 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/30 transition-all text-xs cursor-pointer block"
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                        <span className="font-semibold text-purple-700">{t.subject}</span>
                        <span className="font-mono-numbers">
                          {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at{' '}
                          {d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="font-semibold text-slate-900 line-clamp-1">{t.title}</div>
                      <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
                        <span>{t.category}</span>
                        <span className="font-bold text-slate-700 font-mono-numbers">
                          Priority {t.priorityScore}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Color Key */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-2.5">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Category Color Key
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="text-slate-600">Examination</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <span className="text-slate-600">Assignment</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <span className="text-slate-600">Project</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-slate-600">Laboratory Work</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-600">Revision</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
