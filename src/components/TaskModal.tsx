import React, { useState, useEffect } from 'react';
import { X, Sparkles, Clock, Calendar, BookOpen, AlertCircle, Plus } from 'lucide-react';
import { Task, TaskCategory, ImportanceLevel, DifficultyLevel, Subject } from '../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Partial<Task>) => Promise<void>;
  initialTask?: Task | null;
  subjects?: Subject[];
  onOpenAddSubject?: () => void;
}

const CATEGORIES: TaskCategory[] = [
  'Assignment',
  'Examination',
  'Project',
  'Revision',
  'Laboratory Work',
  'Personal Study',
];

const IMPORTANCE_LEVELS: ImportanceLevel[] = ['Low', 'Medium', 'High', 'Critical'];
const DIFFICULTY_LEVELS: DifficultyLevel[] = ['Easy', 'Medium', 'Hard', 'Very Hard'];

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTask,
  subjects = [],
  onOpenAddSubject,
}) => {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [subjectId, setSubjectId] = useState<string | undefined>(undefined);
  const [credits, setCredits] = useState<number>(3);
  const [category, setCategory] = useState<TaskCategory>('Assignment');
  const [deadlineDate, setDeadlineDate] = useState('');
  const [deadlineTime, setDeadlineTime] = useState('23:59');
  const [importance, setImportance] = useState<ImportanceLevel>('Medium');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Medium');
  const [estimatedDuration, setEstimatedDuration] = useState('60');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setSubject(initialTask.subject);
      setSubjectId(initialTask.subjectId);
      setCredits(initialTask.credits || 3);
      setCategory(initialTask.category);
      setImportance(initialTask.importance);
      setDifficulty(initialTask.difficulty);
      setEstimatedDuration(String(initialTask.estimatedDuration));
      setDescription(initialTask.description || '');

      const d = new Date(initialTask.deadline);
      if (!isNaN(d.getTime())) {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        setDeadlineDate(`${yyyy}-${mm}-${dd}`);
        const hh = String(d.getHours()).padStart(2, '0');
        const min = String(d.getMinutes()).padStart(2, '0');
        setDeadlineTime(`${hh}:${min}`);
      }
    } else {
      // Default to tomorrow 18:00
      const tomorrow = new Date(Date.now() + 86400000);
      const yyyy = tomorrow.getFullYear();
      const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
      const dd = String(tomorrow.getDate()).padStart(2, '0');
      setDeadlineDate(`${yyyy}-${mm}-${dd}`);
      setDeadlineTime('18:00');
      setTitle('');
      // If subjects exist, default to the first one
      if (subjects.length > 0) {
        setSubject(subjects[0].name);
        setSubjectId(subjects[0].id);
        setCredits(subjects[0].credits || 3);
      } else {
        setSubject('');
        setSubjectId(undefined);
        setCredits(3);
      }
      setCategory('Assignment');
      setImportance('Medium');
      setDifficulty('Medium');
      setEstimatedDuration('60');
      setDescription('');
    }
    setError('');
  }, [initialTask, isOpen, subjects]);

  if (!isOpen) return null;

  const handleSubjectChange = (val: string) => {
    if (val === '__ADD_NEW__') {
      if (onOpenAddSubject) onOpenAddSubject();
      return;
    }
    const found = subjects.find((s) => s.id === val || s.name === val);
    if (found) {
      setSubject(found.name);
      setSubjectId(found.id);
      setCredits(found.credits);
    } else {
      setSubject(val);
      setSubjectId(undefined);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a task title');
      return;
    }
    if (!subject.trim()) {
      setError('Please select or enter the subject');
      return;
    }
    if (!deadlineDate) {
      setError('Please select a deadline date');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      const combinedIso = new Date(`${deadlineDate}T${deadlineTime || '23:59'}:00`).toISOString();

      await onSave({
        title: title.trim(),
        subject: subject.trim(),
        subjectId,
        credits,
        category,
        deadline: combinedIso,
        importance,
        difficulty,
        estimatedDuration: parseInt(estimatedDuration, 10) || 60,
        remainingDuration: parseInt(estimatedDuration, 10) || 60,
        description: description.trim(),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              {initialTask ? 'Edit Task' : 'Add New Task'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-medium text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement Dijkstra Algorithm & Benchmark"
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* Subject & Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Subject / Course <span className="text-rose-500">*</span>
                </label>
                {onOpenAddSubject && (
                  <button
                    type="button"
                    onClick={onOpenAddSubject}
                    className="text-[11px] font-medium text-purple-600 hover:text-purple-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add New Subject</span>
                  </button>
                )}
              </div>

              {subjects.length > 0 ? (
                <div className="space-y-1.5">
                  <select
                    value={subjectId || subject}
                    onChange={(e) => handleSubjectChange(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all text-slate-900 font-medium"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.credits} {s.credits === 1 ? 'Credit' : 'Credits'})
                      </option>
                    ))}
                    <option value="__ADD_NEW__">+ Enter new semester subject...</option>
                  </select>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                    <span>Credit Weight:</span>
                    <span className="font-bold text-purple-700">{credits} Credits</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Operating Systems"
                    className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all text-slate-900"
                  />
                  {onOpenAddSubject && (
                    <button
                      type="button"
                      onClick={onOpenAddSubject}
                      className="w-full py-1.5 text-xs text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer font-medium"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Setup Semester Subjects & Credits First</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all text-slate-900"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Deadline Date & Time Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Deadline Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={deadlineDate}
                onChange={(e) => setDeadlineDate(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Deadline Time</label>
              <input
                type="time"
                value={deadlineTime}
                onChange={(e) => setDeadlineTime(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all text-slate-900"
              />
            </div>
          </div>

          {/* Importance & Difficulty */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Importance Level
              </label>
              <select
                value={importance}
                onChange={(e) => setImportance(e.target.value as ImportanceLevel)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all text-slate-900"
              >
                {IMPORTANCE_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl} ({lvl === 'Critical' ? '100 pts' : lvl === 'High' ? '75 pts' : lvl === 'Medium' ? '50 pts' : '25 pts'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all text-slate-900"
              >
                {DIFFICULTY_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Est. Duration (min)
              </label>
              <input
                type="number"
                min="10"
                max="600"
                step="5"
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all text-slate-900 font-mono-numbers"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Instructions & Notes <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Include test cases, write documentation summary in PDF, review rubric section 3..."
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all text-slate-900 resize-none placeholder:text-slate-400"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Saving...' : initialTask ? 'Update Task' : 'Add to Prioritizer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
