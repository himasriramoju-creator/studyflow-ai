import React, { useState, useEffect } from 'react';
import { X, BookOpen, AlertCircle, Award, Check } from 'lucide-react';
import { Subject } from '../types';

interface SubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (subjectData: {
    name: string;
    code?: string;
    credits: number;
    color?: string;
    semester?: string;
  }) => Promise<void>;
  initialSubject?: Subject | null;
}

const COLOR_OPTIONS = [
  { id: 'purple', label: 'Lavender / Purple', bg: 'bg-purple-100 text-purple-700 border-purple-300' },
  { id: 'indigo', label: 'Indigo', bg: 'bg-indigo-100 text-indigo-700 border-indigo-300' },
  { id: 'blue', label: 'Sky Blue', bg: 'bg-sky-100 text-sky-700 border-sky-300' },
  { id: 'emerald', label: 'Emerald Green', bg: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
  { id: 'amber', label: 'Warm Amber', bg: 'bg-amber-100 text-amber-700 border-amber-300' },
  { id: 'rose', label: 'Rose Pink', bg: 'bg-rose-100 text-rose-700 border-rose-300' },
  { id: 'teal', label: 'Teal', bg: 'bg-teal-100 text-teal-700 border-teal-300' },
];

export const SubjectModal: React.FC<SubjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialSubject,
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [credits, setCredits] = useState<number>(3);
  const [color, setColor] = useState('purple');
  const [semester, setSemester] = useState('Current Semester');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialSubject) {
      setName(initialSubject.name);
      setCode(initialSubject.code || '');
      setCredits(initialSubject.credits || 3);
      setColor(initialSubject.color || 'purple');
      setSemester(initialSubject.semester || 'Current Semester');
    } else {
      setName('');
      setCode('');
      setCredits(3);
      setColor('purple');
      setSemester('Current Semester');
    }
    setError('');
  }, [initialSubject, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a subject name');
      return;
    }
    if (credits < 1 || credits > 12) {
      setError('Credits must be between 1 and 12');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await onSave({
        name: name.trim(),
        code: code.trim() || undefined,
        credits: Number(credits),
        color,
        semester: semester.trim() || 'Current Semester',
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save subject');
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
      <div className="relative z-10 bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {initialSubject ? 'Edit Semester Subject' : 'Add Semester Subject'}
              </h2>
              <p className="text-xs text-slate-500">
                Configure your course name and assigned credit weight
              </p>
            </div>
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

          {/* Subject Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Subject / Course Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Operating Systems, Multivariable Calculus, Macroeconomics"
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* Course Code & Semester */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Course Code <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. CS 301, MATH 204"
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Semester / Term
              </label>
              <input
                type="text"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                placeholder="e.g. Current Semester, Semester 5"
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all text-slate-900"
              />
            </div>
          </div>

          {/* Number of Credits - Important User Requirement */}
          <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-purple-600" />
                <span>Assigned Credits (1 – 12)</span>
                <span className="text-rose-500">*</span>
              </label>
              <span className="text-xs font-extrabold text-purple-700 font-mono-numbers">
                {credits} {credits === 1 ? 'Credit' : 'Credits'}
              </span>
            </div>

            <p className="text-[11px] text-slate-500 mb-3">
              Higher credit courses will be automatically weighted with greater academic importance in the AI prioritizer.
            </p>

            {/* Quick Credit Select Buttons */}
            <div className="grid grid-cols-6 gap-2 mb-3">
              {[1, 2, 3, 4, 5, 6].map((cr) => (
                <button
                  key={cr}
                  type="button"
                  onClick={() => setCredits(cr)}
                  className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    credits === cr
                      ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-purple-300 hover:bg-purple-50/50'
                  }`}
                >
                  {cr} cr
                </button>
              ))}
            </div>

            {/* Number input for custom credits */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-600">Custom credits:</span>
              <input
                type="number"
                min="1"
                max="12"
                value={credits}
                onChange={(e) => setCredits(Math.max(1, Math.min(12, parseInt(e.target.value, 10) || 1)))}
                className="w-20 px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg text-slate-900 text-center font-mono-numbers"
              />
            </div>
          </div>

          {/* Color Tag Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Color Identifier
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setColor(c.id)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${c.bg} ${
                    color === c.id ? 'ring-2 ring-purple-600 ring-offset-1 font-bold' : 'opacity-80 hover:opacity-100'
                  }`}
                >
                  {color === c.id && <Check className="w-3 h-3" />}
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
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
              {isSubmitting ? 'Saving...' : initialSubject ? 'Update Subject' : 'Save Subject'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
