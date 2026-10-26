import React, { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, CheckCircle2, Flame, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Task } from '../types';

interface FocusTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onTaskCompleted: (task: Task) => void;
}

export const FocusTimerModal: React.FC<FocusTimerModalProps> = ({
  isOpen,
  onClose,
  task,
  onTaskCompleted,
}) => {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(25);

  useEffect(() => {
    if (task) {
      const dur = Math.min(task.estimatedDuration || 25, 45);
      setSelectedDuration(dur);
      setMinutes(dur);
      setSeconds(0);
      setIsActive(false);
    }
  }, [task, isOpen]);

  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          // Timer finished!
          setIsActive(false);
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, minutes, seconds]);

  if (!isOpen || !task) return null;

  const handleDurationSelect = (mins: number) => {
    setSelectedDuration(mins);
    setMinutes(mins);
    setSeconds(0);
    setIsActive(false);
  };

  const handleReset = () => {
    setIsActive(false);
    setMinutes(selectedDuration);
    setSeconds(0);
  };

  const handleFinishEarly = () => {
    setIsActive(false);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
    onTaskCompleted(task);
    onClose();
  };

  const totalSeconds = selectedDuration * 60;
  const currentSeconds = minutes * 60 + seconds;
  const progressPercent = totalSeconds > 0 ? ((totalSeconds - currentSeconds) / totalSeconds) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />
      <div className="relative z-10 bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 flex flex-col items-center animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
          <Flame className="w-5 h-5" />
        </div>

        <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-1">
          Deep Focus Mode
        </span>
        <h2 className="text-base font-bold text-slate-900 text-center px-4 line-clamp-1">
          {task.title}
        </h2>
        <p className="text-xs text-slate-500 mb-6">{task.subject} · Priority Score: {task.priorityScore}</p>

        {/* Circular / Large Timer Display */}
        <div className="relative flex items-center justify-center w-52 h-52 rounded-full border-4 border-slate-100 mb-6 bg-slate-50/50">
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="104"
              cy="104"
              r="96"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="6"
            />
            <circle
              cx="104"
              cy="104"
              r="96"
              fill="none"
              stroke="url(#purpleGrad)"
              strokeWidth="6"
              strokeDasharray={603}
              strokeDashoffset={603 - (603 * progressPercent) / 100}
              strokeLinecap="round"
              className="transition-all duration-300"
            />
            <defs>
              <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#9333ea" />
                <stop offset="100%" stopColor="#4f46e5" />
              </linearGradient>
            </defs>
          </svg>

          <div className="flex flex-col items-center justify-center z-10">
            <span className="text-4xl font-extrabold text-slate-900 font-mono-numbers tracking-tight">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
            <span className="text-xs font-medium text-slate-400 mt-1">
              {isActive ? 'Session in progress' : 'Paused'}
            </span>
          </div>
        </div>

        {/* Duration Selectors */}
        <div className="flex items-center gap-2 mb-6">
          {[15, 25, 45, 60].map((dur) => (
            <button
              key={dur}
              disabled={isActive}
              onClick={() => handleDurationSelect(dur)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                selectedDuration === dur
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {dur}m
            </button>
          ))}
        </div>

        {/* Timer Controls */}
        <div className="flex items-center gap-3 w-full justify-center mb-4">
          <button
            onClick={handleReset}
            className="p-3 text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            title="Reset Timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsActive(!isActive)}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            {isActive ? (
              <>
                <Pause className="w-5 h-5 fill-white" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-white" />
                <span>Start Focus</span>
              </>
            )}
          </button>

          <button
            onClick={handleFinishEarly}
            className="p-3 text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors cursor-pointer"
            title="Mark Task as Completed Now"
          >
            <CheckCircle2 className="w-5 h-5" />
          </button>
        </div>

        <p className="text-[11px] text-slate-400 text-center">
          Completing this session awards +50 student points and maintains your daily study streak.
        </p>
      </div>
    </div>
  );
};
