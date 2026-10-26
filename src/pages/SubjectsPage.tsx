import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Award,
  Edit2,
  Trash2,
  GraduationCap,
  Layers,
  CheckCircle2,
  Clock,
  ArrowRight,
  Info,
} from 'lucide-react';
import { Subject, Task } from '../types';

interface SubjectsPageProps {
  subjects: Subject[];
  tasks: Task[];
  onOpenAddSubject: () => void;
  onEditSubject: (subject: Subject) => void;
  onDeleteSubject: (subjectId: string) => Promise<void>;
  onAddTaskForSubject: (subjectName: string, subjectId: string, credits: number) => void;
}

export const SubjectsPage: React.FC<SubjectsPageProps> = ({
  subjects,
  tasks,
  onOpenAddSubject,
  onEditSubject,
  onDeleteSubject,
  onAddTaskForSubject,
}) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Compute statistics
  const totalCredits = subjects.reduce((sum, s) => sum + (s.credits || 0), 0);
  const totalSubjects = subjects.length;

  const handleDelete = async (subject: Subject) => {
    const linkedTasks = tasks.filter((t) => t.subjectId === subject.id || t.subject === subject.name);
    let confirmMsg = `Are you sure you want to remove "${subject.name}"?`;
    if (linkedTasks.length > 0) {
      confirmMsg += ` It currently has ${linkedTasks.length} associated coursework tasks.`;
    }
    if (!window.confirm(confirmMsg)) return;

    try {
      setDeletingId(subject.id);
      await onDeleteSubject(subject.id);
    } catch (err: any) {
      alert(err.message || 'Failed to delete subject');
    } finally {
      setDeletingId(null);
    }
  };

  const getSubjectColorStyles = (color?: string) => {
    switch (color) {
      case 'indigo':
        return { badge: 'bg-indigo-50 text-indigo-700 border-indigo-200', dot: 'bg-indigo-600', ring: 'hover:border-indigo-300' };
      case 'blue':
        return { badge: 'bg-sky-50 text-sky-700 border-sky-200', dot: 'bg-sky-600', ring: 'hover:border-sky-300' };
      case 'emerald':
        return { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-600', ring: 'hover:border-emerald-300' };
      case 'amber':
        return { badge: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-600', ring: 'hover:border-amber-300' };
      case 'rose':
        return { badge: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-600', ring: 'hover:border-rose-300' };
      case 'teal':
        return { badge: 'bg-teal-50 text-teal-700 border-teal-200', dot: 'bg-teal-600', ring: 'hover:border-teal-300' };
      default:
        return { badge: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-600', ring: 'hover:border-purple-300' };
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-50/90 via-white to-indigo-50/70 rounded-3xl p-6 sm:p-8 border border-purple-100/90 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-600 text-white shadow-2xs">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Academic Curriculum</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Semester Subjects & Credits
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Customize your enrolled courses and assigned credits for your university semester. Higher credit courses carry greater weight in the AI study schedule.
            </p>
          </div>

          <button
            onClick={onOpenAddSubject}
            className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Subject & Credits</span>
          </button>
        </div>
      </div>

      {/* Credit Overview Bento Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
            <span>Enrolled Courses</span>
            <span className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
              <BookOpen className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono-numbers">
              {totalSubjects}
            </span>
            <span className="text-xs text-slate-400">active subjects</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            {totalSubjects === 0 ? 'No subjects registered yet' : 'Organized across current semester'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
            <span>Total Semester Credits</span>
            <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Award className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-purple-700 font-mono-numbers">
              {totalCredits}
            </span>
            <span className="text-xs text-slate-400">credit units</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            {totalCredits >= 12
              ? 'Full-Time Academic Coursework Load'
              : totalCredits > 0
              ? 'Part-Time / Standard Load'
              : 'Add courses to calculate credit load'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
            <span>Linked Coursework Tasks</span>
            <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <Layers className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono-numbers">
              {tasks.length}
            </span>
            <span className="text-xs text-slate-400">assignments & exams</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            {tasks.filter((t) => t.status === 'Completed').length} completed milestones
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      {subjects.length === 0 ? (
        /* Empty State with Explicit Prompt */
        <div className="bg-white rounded-3xl border-2 border-dashed border-purple-200 p-8 sm:p-12 text-center space-y-4 max-w-2xl mx-auto shadow-2xs">
          <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto shadow-inner">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900">
              No Semester Subjects Added Yet
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
              Every college student has a unique semester syllabus. Enter your enrolled courses and assign the number of credits for each (e.g. 3 or 4 credits) so your study planner and priority scores accurately reflect your semester workload.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={onOpenAddSubject}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Enter Your Semester Subjects & Credits</span>
            </button>
          </div>

          <div className="pt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
            <Info className="w-3.5 h-3.5 text-purple-500" />
            <span>Example: Operating Systems (4 cr), Calculus III (3 cr), Physics Lab (2 cr)</span>
          </div>
        </div>
      ) : (
        /* Subject Cards Grid */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Your Enrolled Courses ({subjects.length})
            </h2>
            <span className="text-xs text-slate-500">
              Click "+ Add Task" to queue coursework directly under a course
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((subj) => {
              const styles = getSubjectColorStyles(subj.color);
              const linkedTasks = tasks.filter(
                (t) => t.subjectId === subj.id || t.subject === subj.name
              );
              const activeCount = linkedTasks.filter((t) => t.status !== 'Completed').length;
              const completedCount = linkedTasks.filter((t) => t.status === 'Completed').length;

              return (
                <div
                  key={subj.id}
                  className={`bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs transition-all hover:shadow-sm ${styles.ring} flex flex-col justify-between`}
                >
                  <div>
                    {/* Top Tag Row */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border flex items-center gap-1.5 ${styles.badge}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
                        <span>{subj.credits} {subj.credits === 1 ? 'Credit' : 'Credits'}</span>
                      </span>

                      {subj.code && (
                        <span className="text-xs font-mono font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                          {subj.code}
                        </span>
                      )}
                    </div>

                    {/* Subject Title */}
                    <h3 className="text-lg font-bold text-slate-900 leading-snug">
                      {subj.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {subj.semester || 'Current Semester'}
                    </p>

                    {/* Task Stats for this Subject */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3 text-slate-600">
                        <span className="flex items-center gap-1 font-mono-numbers">
                          <Layers className="w-3.5 h-3.5 text-purple-600" />
                          <span>{activeCount} active</span>
                        </span>
                        <span className="flex items-center gap-1 font-mono-numbers">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{completedCount} done</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onAddTaskForSubject(subj.name, subj.id, subj.credits)}
                      className="text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg border border-purple-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Task</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditSubject(subj)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Edit course & credits"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(subj)}
                        disabled={deletingId === subj.id}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                        title="Delete course"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
