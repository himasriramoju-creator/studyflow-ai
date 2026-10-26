import React, { useState } from 'react';
import { X, Sliders, RotateCcw, Check } from 'lucide-react';
import { PriorityWeights } from '../types';
import { DEFAULT_PRIORITY_WEIGHTS } from '../services/prioritizer';

interface WeightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  weights: PriorityWeights;
  onSaveWeights: (newWeights: PriorityWeights) => void;
}

export const WeightsModal: React.FC<WeightsModalProps> = ({
  isOpen,
  onClose,
  weights,
  onSaveWeights,
}) => {
  const [urgency, setUrgency] = useState(weights.urgency * 100);
  const [importance, setImportance] = useState(weights.importance * 100);
  const [difficulty, setDifficulty] = useState(weights.difficulty * 100);
  const [timeFit, setTimeFit] = useState(weights.timeFit * 100);

  if (!isOpen) return null;

  const total = urgency + importance + difficulty + timeFit;

  const handleReset = () => {
    setUrgency(DEFAULT_PRIORITY_WEIGHTS.urgency * 100);
    setImportance(DEFAULT_PRIORITY_WEIGHTS.importance * 100);
    setDifficulty(DEFAULT_PRIORITY_WEIGHTS.difficulty * 100);
    setTimeFit(DEFAULT_PRIORITY_WEIGHTS.timeFit * 100);
  };

  const handleApply = () => {
    // Normalize to 1.0
    const factor = total > 0 ? 1 / total : 1;
    const normalized: PriorityWeights = {
      urgency: Number(((urgency * factor) || 0.4).toFixed(2)),
      importance: Number(((importance * factor) || 0.3).toFixed(2)),
      difficulty: Number(((difficulty * factor) || 0.2).toFixed(2)),
      timeFit: Number(((timeFit * factor) || 0.1).toFixed(2)),
    };
    onSaveWeights(normalized);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />
      <div className="relative z-10 bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Tune Algorithm Weights</h2>
              <p className="text-xs text-slate-500">Custom priority calculation parameters</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-4">
          {/* Urgency */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>Deadline Urgency</span>
              <span className="font-mono-numbers text-purple-600 font-bold">{Math.round(urgency)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={urgency}
              onChange={(e) => setUrgency(Number(e.target.value))}
              className="w-full accent-purple-600 cursor-pointer"
            />
          </div>

          {/* Importance */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>Task Importance</span>
              <span className="font-mono-numbers text-purple-600 font-bold">{Math.round(importance)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={importance}
              onChange={(e) => setImportance(Number(e.target.value))}
              className="w-full accent-purple-600 cursor-pointer"
            />
          </div>

          {/* Difficulty */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>Task Difficulty</span>
              <span className="font-mono-numbers text-purple-600 font-bold">{Math.round(difficulty)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={difficulty}
              onChange={(e) => setDifficulty(Number(e.target.value))}
              className="w-full accent-purple-600 cursor-pointer"
            />
          </div>

          {/* Time Fit */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>Session Time Fit</span>
              <span className="font-mono-numbers text-purple-600 font-bold">{Math.round(timeFit)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={timeFit}
              onChange={(e) => setTimeFit(Number(e.target.value))}
              className="w-full accent-purple-600 cursor-pointer"
            />
          </div>

          <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 flex items-center justify-between">
            <span>Effective Total Allocation:</span>
            <span
              className={`font-semibold font-mono-numbers ${
                Math.round(total) === 100 ? 'text-emerald-600' : 'text-amber-600'
              }`}
            >
              {Math.round(total)}% {Math.round(total) !== 100 && '(auto-normalized to 100%)'}
            </span>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-xs flex items-center gap-1 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply Weights</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
