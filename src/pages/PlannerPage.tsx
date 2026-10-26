import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Clock,
  Coffee,
  AlertTriangle,
  Play,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronRight,
  Sliders,
} from 'lucide-react';
import { StudyScheduleSlot, Task, PriorityWeights } from '../types';
import { api } from '../services/api';

interface PlannerPageProps {
  onStartFocus: (task: Task) => void;
  allTasks: Task[];
  weights: PriorityWeights;
}

export const PlannerPage: React.FC<PlannerPageProps> = ({
  onStartFocus,
  allTasks,
  weights,
}) => {
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [sessionMinutes, setSessionMinutes] = useState(45);
  const [breakMinutes, setBreakMinutes] = useState(15);
  const [maxDailyHours, setMaxDailyHours] = useState(6.0);

  const [schedule, setSchedule] = useState<StudyScheduleSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalStudyMinutes, setTotalStudyMinutes] = useState(0);
  const [totalBreakMinutes, setTotalBreakMinutes] = useState(0);
  const [isOverloaded, setIsOverloaded] = useState(false);
  const [overloadMinutes, setOverloadMinutes] = useState(0);
  const [advice, setAdvice] = useState('');

  const loadPreferencesAndSchedule = async () => {
    try {
      setLoading(true);
      const prefRes = await api.getPreferences();
      const p = prefRes.preferences;
      if (p) {
        setStartTime(p.preferredStartTime || '09:00');
        setEndTime(p.preferredEndTime || '17:00');
        setSessionMinutes(p.preferredSessionMinutes || 45);
        setBreakMinutes(p.breakDurationMinutes || 15);
        setMaxDailyHours(p.maxDailyHours || 6.0);
      }

      const planRes = await api.generatePlan({
        startTime: p?.preferredStartTime || '09:00',
        endTime: p?.preferredEndTime || '17:00',
        sessionMinutes: p?.preferredSessionMinutes || 45,
        breakMinutes: p?.breakDurationMinutes || 15,
        maxDailyHours: p?.maxDailyHours || 6.0,
        weights,
      });

      setSchedule(planRes.schedule);
      setTotalStudyMinutes(planRes.totalStudyMinutes);
      setTotalBreakMinutes(planRes.totalBreakMinutes);
      setIsOverloaded(planRes.isOverloaded);
      setOverloadMinutes(planRes.overloadMinutes);
      setAdvice(planRes.advice);
    } catch (err) {
      console.error('Failed to generate study schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPreferencesAndSchedule();
  }, [weights]);

  const handleRegenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setLoading(true);
      const planRes = await api.generatePlan({
        startTime,
        endTime,
        sessionMinutes,
        breakMinutes,
        maxDailyHours,
        weights,
      });

      setSchedule(planRes.schedule);
      setTotalStudyMinutes(planRes.totalStudyMinutes);
      setTotalBreakMinutes(planRes.totalBreakMinutes);
      setIsOverloaded(planRes.isOverloaded);
      setOverloadMinutes(planRes.overloadMinutes);
      setAdvice(planRes.advice);

      // Save user preferences
      await api.updatePreferences({
        preferredStartTime: startTime,
        preferredEndTime: endTime,
        preferredSessionMinutes: sessionMinutes,
        breakDurationMinutes: breakMinutes,
        maxDailyHours,
      });
    } catch (err) {
      console.error('Failed to regenerate schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSlotCompleted = (slotId: string) => {
    setSchedule((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, completed: !s.completed } : s))
    );
  };

  const handleStartTaskForSlot = (slot: StudyScheduleSlot) => {
    if (!slot.taskId) return;
    const task = allTasks.find((t) => t.id === slot.taskId);
    if (task) {
      onStartFocus(task);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 mb-1 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Automated Scheduling Engine</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Daily Study Schedule & Timeline
          </h1>
          <p className="text-xs text-slate-500">
            Intelligently maps high-priority tasks into your daily window with restorative break buffers.
          </p>
        </div>

        <button
          onClick={() => handleRegenerate()}
          disabled={loading}
          className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-lg shadow-xs hover:shadow transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Regenerate Study Plan</span>
        </button>
      </div>

      {/* Preferences / Availability Controls Strip */}
      <form
        onSubmit={handleRegenerate}
        className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-4"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
            Study Window & Session Parameters
          </span>
          <button
            type="submit"
            className="text-xs font-semibold text-purple-600 hover:text-purple-700"
          >
            Apply Changes
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {/* Start Time */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Start Time
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
            />
          </div>

          {/* End Time */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              End Time
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
            />
          </div>

          {/* Preferred Session Length */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Session Length
            </label>
            <select
              value={sessionMinutes}
              onChange={(e) => setSessionMinutes(Number(e.target.value))}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
            >
              <option value={25}>25 min (Pomodoro)</option>
              <option value={45}>45 min (Standard)</option>
              <option value={60}>60 min (Deep Work)</option>
              <option value={90}>90 min (Intense Sprint)</option>
            </select>
          </div>

          {/* Break Duration */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Break Buffer
            </label>
            <select
              value={breakMinutes}
              onChange={(e) => setBreakMinutes(Number(e.target.value))}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
            >
              <option value={5}>5 min (Short)</option>
              <option value={10}>10 min (Ideal)</option>
              <option value={15}>15 min (Refuel)</option>
              <option value={20}>20 min (Extended)</option>
            </select>
          </div>

          {/* Max Daily Hours */}
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Max Daily Study
            </label>
            <select
              value={maxDailyHours}
              onChange={(e) => setMaxDailyHours(Number(e.target.value))}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
            >
              <option value={3.0}>3.0 hours</option>
              <option value={4.5}>4.5 hours</option>
              <option value={6.0}>6.0 hours</option>
              <option value={8.0}>8.0 hours</option>
            </select>
          </div>
        </div>
      </form>

      {/* Overload Warning Banner if workload exceeds available window */}
      {isOverloaded && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900">
            <strong className="font-semibold block mb-0.5">High Workload Alert:</strong>
            {advice}
          </div>
        </div>
      )}

      {/* Plan Summary Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500">Focused Study Time</div>
          <div className="text-xl font-bold text-slate-900 font-mono-numbers mt-0.5">
            {Math.floor(totalStudyMinutes / 60)}h {totalStudyMinutes % 60}m
          </div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500">Rest & Recharge</div>
          <div className="text-xl font-bold text-emerald-600 font-mono-numbers mt-0.5">
            {totalBreakMinutes} mins
          </div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500">Scheduled Blocks</div>
          <div className="text-xl font-bold text-purple-600 font-mono-numbers mt-0.5">
            {schedule.filter((s) => s.type === 'task').length} Sessions
          </div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500">Daily Window</div>
          <div className="text-xl font-bold text-slate-700 font-mono-numbers mt-0.5">
            {startTime} – {endTime}
          </div>
        </div>
      </div>

      {/* Interactive Timeline Display */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Schedule Timeline</h2>
            <p className="text-xs text-slate-500">
              Click any study block to start its focus session with the interactive timer.
            </p>
          </div>
          <div className="text-xs text-slate-500">
            {schedule.filter((s) => s.completed).length} / {schedule.length} slots completed
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-20 bg-slate-50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : schedule.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <Clock className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">No active tasks to schedule</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You either completed all queued tasks or haven't added any yet. Add coursework to generate a personalized timeline.
            </p>
          </div>
        ) : (
          <div className="relative pl-6 sm:pl-8 space-y-4 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
            {schedule.map((slot) => {
              const isBreak = slot.type === 'break';
              return (
                <div key={slot.id} className="relative group">
                  {/* Timeline Node Dot */}
                  <div
                    className={`absolute -left-6 sm:-left-8 top-3 w-4 h-4 rounded-full border-2 bg-white transition-colors ${
                      slot.completed
                        ? 'border-emerald-500 bg-emerald-500'
                        : isBreak
                        ? 'border-emerald-400'
                        : 'border-purple-600'
                    }`}
                  />

                  {/* Slot Card */}
                  <div
                    className={`p-4 rounded-xl border transition-all ${
                      slot.completed
                        ? 'bg-slate-50/70 border-slate-200 opacity-60'
                        : isBreak
                        ? 'bg-emerald-50/40 border-emerald-100'
                        : 'bg-white border-slate-200 hover:border-purple-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        {isBreak ? (
                          <div className="w-8 h-8 rounded-lg bg-emerald-100/60 text-emerald-700 flex items-center justify-center shrink-0">
                            <Coffee className="w-4 h-4" />
                          </div>
                        ) : (
                          <button
                            onClick={() => handleToggleSlotCompleted(slot.id)}
                            className="mt-0.5 text-slate-400 hover:text-purple-600 transition-colors cursor-pointer shrink-0"
                          >
                            {slot.completed ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                            ) : (
                              <div className="w-5 h-5 rounded-full border-2 border-slate-300 hover:border-purple-500" />
                            )}
                          </button>
                        )}

                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <span className="text-xs font-bold font-mono-numbers text-slate-700">
                              {slot.startTime} – {slot.endTime}
                            </span>
                            <span className="text-xs text-slate-400">·</span>
                            <span className="text-xs text-slate-500 font-mono-numbers">
                              {slot.durationMinutes} mins
                            </span>
                            {slot.subject && (
                              <>
                                <span className="text-xs text-slate-400">·</span>
                                <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                                  {slot.subject}
                                </span>
                              </>
                            )}
                          </div>

                          <h3
                            className={`text-sm font-semibold ${
                              slot.completed
                                ? 'line-through text-slate-400'
                                : isBreak
                                ? 'text-emerald-900'
                                : 'text-slate-900'
                            }`}
                          >
                            {slot.taskTitle}
                          </h3>
                        </div>
                      </div>

                      {/* Action */}
                      {!isBreak && !slot.completed && (
                        <button
                          onClick={() => handleStartTaskForSlot(slot)}
                          className="px-3.5 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-center cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-purple-700" />
                          <span>Start Focus</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
