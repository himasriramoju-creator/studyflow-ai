import React, { useState, useEffect } from 'react';
import { X, Sparkles, Brain, Clock, Zap, CheckCircle2, RefreshCw } from 'lucide-react';
import { Task } from '../types';
import { api } from '../services/api';

interface AIInsightModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AIInsightModal: React.FC<AIInsightModalProps> = ({ task, isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [aiText, setAiText] = useState('');
  const [source, setSource] = useState('');

  useEffect(() => {
    if (isOpen && task) {
      loadExplanation(task.id);
    }
  }, [isOpen, task]);

  const loadExplanation = async (taskId: string) => {
    setLoading(true);
    try {
      const res = await api.explainTask(taskId);
      setAiText(res.aiExplanation);
      setSource(res.source);
    } catch {
      setAiText(
        `Priority Score ${task?.priorityScore}/100: ${task?.breakdown?.explanation || 'Balanced score based on upcoming deadline and difficulty.'}`
      );
      setSource('rule-engine');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !task) return null;

  const breakdown = task.breakdown || {
    urgencyScore: 50,
    importanceScore: 50,
    difficultyScore: 50,
    timeFitScore: 50,
    rawScore: task.priorityScore,
    explanation: '',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative z-10 bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-purple-50/50 via-white to-indigo-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center shadow-xs">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">AI Priority Rationale</h2>
              <p className="text-xs text-slate-500">Explainable Multi-Factor Scoring Engine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Task Snapshot */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
              {task.subject}
            </span>
            <h3 className="mt-1 text-sm font-semibold text-slate-900">{task.title}</h3>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
              <span>Importance: {task.importance}</span>
              <span>Difficulty: {task.difficulty}</span>
              <span className="font-mono-numbers">{task.estimatedDuration} mins</span>
            </div>
          </div>

          {/* Mathematical Formula Breakdown */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Formula Weights Breakdown
              </h4>
              <span className="text-xs font-bold text-purple-700 font-mono-numbers">
                Score: {task.priorityScore} / 100
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              {/* Urgency */}
              <div>
                <div className="flex items-center justify-between text-slate-600 mb-1">
                  <span>Deadline Urgency (40%)</span>
                  <span className="font-semibold font-mono-numbers">
                    {breakdown.urgencyScore} / 100 → +{(0.4 * breakdown.urgencyScore).toFixed(1)} pts
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full"
                    style={{ width: `${breakdown.urgencyScore}%` }}
                  />
                </div>
              </div>

              {/* Importance */}
              <div>
                <div className="flex items-center justify-between text-slate-600 mb-1">
                  <span>Importance Level (30%)</span>
                  <span className="font-semibold font-mono-numbers">
                    {breakdown.importanceScore} / 100 → +{(0.3 * breakdown.importanceScore).toFixed(1)} pts
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${breakdown.importanceScore}%` }}
                  />
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <div className="flex items-center justify-between text-slate-600 mb-1">
                  <span>Task Difficulty (20%)</span>
                  <span className="font-semibold font-mono-numbers">
                    {breakdown.difficultyScore} / 100 → +{(0.2 * breakdown.difficultyScore).toFixed(1)} pts
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: `${breakdown.difficultyScore}%` }}
                  />
                </div>
              </div>

              {/* Time Fit */}
              <div>
                <div className="flex items-center justify-between text-slate-600 mb-1">
                  <span>Session Time Fit (10%)</span>
                  <span className="font-semibold font-mono-numbers">
                    {breakdown.timeFitScore} / 100 → +{(0.1 * breakdown.timeFitScore).toFixed(1)} pts
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${breakdown.timeFitScore}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* AI Strategic Advice */}
          <div className="p-4 bg-purple-50/60 rounded-xl border border-purple-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                Strategic Action Plan
              </span>
              {loading && <RefreshCw className="w-3.5 h-3.5 text-purple-500 animate-spin" />}
            </div>

            {loading ? (
              <div className="space-y-1.5 pt-1">
                <div className="h-3 bg-purple-200/60 rounded-sm animate-pulse w-3/4" />
                <div className="h-3 bg-purple-200/60 rounded-sm animate-pulse w-full" />
                <div className="h-3 bg-purple-200/60 rounded-sm animate-pulse w-5/6" />
              </div>
            ) : (
              <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                {aiText}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Engine: {source === 'gemini' ? 'Gemini 3.8 Flash + Multi-Factor' : 'Mathematical Rule-Based AI'}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-medium hover:bg-slate-900 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
