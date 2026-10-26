import React from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  MoreVertical,
  Edit2,
  Trash2,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { Task } from '../types';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onOpenExplain: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
  onOpenExplain,
}) => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const isCompleted = task.status === 'Completed';

  // Format deadline and urgency text
  const deadlineDate = new Date(task.deadline);
  const now = new Date();
  const diffHours = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60);

  let deadlineLabel = '';
  let isOverdue = false;

  if (diffHours < 0) {
    isOverdue = true;
    deadlineLabel = `Overdue by ${Math.abs(Math.round(diffHours))}h`;
  } else if (diffHours < 24) {
    deadlineLabel = `Due in ${Math.round(diffHours)}h`;
  } else {
    const days = Math.round(diffHours / 24);
    deadlineLabel = `Due in ${days} ${days === 1 ? 'day' : 'days'}`;
  }

  // Priority color scheme
  const getPriorityTheme = () => {
    const score = task.priorityScore;
    if (score >= 85 || task.importance === 'Critical') {
      return {
        badge: 'text-rose-700 bg-rose-50 border-rose-200',
        dot: 'bg-rose-500',
        label: 'Critical Priority',
      };
    } else if (score >= 70 || task.importance === 'High') {
      return {
        badge: 'text-amber-700 bg-amber-50 border-amber-200',
        dot: 'bg-amber-500',
        label: 'High Priority',
      };
    } else if (score >= 45 || task.importance === 'Medium') {
      return {
        badge: 'text-blue-700 bg-blue-50 border-blue-200',
        dot: 'bg-blue-500',
        label: 'Medium Priority',
      };
    } else {
      return {
        badge: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        dot: 'bg-emerald-500',
        label: 'Low Priority',
      };
    }
  };

  const priorityTheme = getPriorityTheme();

  return (
    <div
      className={`group relative bg-white rounded-xl border transition-all duration-200 hover:shadow-sm ${
        isCompleted
          ? 'border-slate-200/60 bg-slate-50/50 opacity-70'
          : isOverdue
          ? 'border-rose-200 shadow-xs'
          : 'border-slate-200 hover:border-purple-200'
      } p-4 sm:p-5`}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Complete Checkbox & Task Header */}
        <div className="flex items-start gap-3.5 flex-1 min-w-0">
          <button
            onClick={() => onToggleComplete(task)}
            className="mt-0.5 text-slate-400 hover:text-purple-600 transition-colors cursor-pointer shrink-0"
            title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
          >
            {isCompleted ? (
              <CheckCircle2 className="w-5 h-5 text-purple-600 fill-purple-100" />
            ) : (
              <Circle className="w-5 h-5 hover:text-purple-600" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100 flex items-center gap-1.5">
                <span>{task.subject}</span>
                {task.credits ? (
                  <span className="bg-purple-200/60 text-purple-800 text-[10px] px-1.5 py-0.2 rounded font-bold">
                    {task.credits} cr
                  </span>
                ) : null}
              </span>
              <span className="text-xs text-slate-500">·</span>
              <span className="text-xs text-slate-500">{task.category}</span>
              {isOverdue && !isCompleted && (
                <>
                  <span className="text-xs text-slate-500">·</span>
                  <span className="text-xs font-semibold text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Overdue
                  </span>
                </>
              )}
            </div>

            <h3
              className={`text-base font-semibold leading-snug break-words ${
                isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
              }`}
            >
              {task.title}
            </h3>

            {task.description && (
              <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {task.description}
              </p>
            )}

            {/* Metadata Footer: Deadline, Duration, Difficulty */}
            <div className="mt-3 flex items-center gap-4 text-xs text-slate-500 flex-wrap">
              <div
                className={`flex items-center gap-1.5 font-medium ${
                  isOverdue && !isCompleted ? 'text-rose-600 font-semibold' : 'text-slate-600'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {deadlineDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}{' '}
                  at{' '}
                  {deadlineDate.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </span>
                <span className="text-slate-400 font-normal">({deadlineLabel})</span>
              </div>

              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-mono-numbers">{task.estimatedDuration} mins</span>
              </div>

              <div className="text-slate-500">
                Difficulty:{' '}
                <span className="font-medium text-slate-700">{task.difficulty}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Priority Badge & Action Menu */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="flex items-center gap-1.5">
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${priorityTheme.badge}`}
              title={`Urgency: ${task.breakdown?.urgencyScore ?? '--'}, Importance: ${
                task.breakdown?.importanceScore ?? '--'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${priorityTheme.dot}`} />
              <span className="font-mono-numbers">{task.priorityScore}</span>
              <span className="hidden sm:inline font-normal opacity-80">pts</span>
            </span>

            {/* More Options Menu */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-30">
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onEdit(task);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>Edit Task</span>
                    </button>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onDelete(task.id);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                      <span>Delete</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* AI Prioritization Deep Dive Trigger */}
          <button
            onClick={() => onOpenExplain(task)}
            className="text-[11px] font-medium text-purple-600 hover:text-purple-800 bg-purple-50/70 hover:bg-purple-100/80 px-2 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
            title="View AI mathematical rationale and study recommendations"
          >
            <Sparkles className="w-3 h-3 text-purple-500" />
            <span>AI Rationale</span>
          </button>
        </div>
      </div>
    </div>
  );
};
