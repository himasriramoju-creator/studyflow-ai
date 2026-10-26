import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Brain,
  Calendar,
  BarChart3,
  Clock,
  ShieldCheck,
  Zap,
  CheckCircle2,
  ChevronRight,
  Flame,
  Award,
  BookOpen,
} from 'lucide-react';
import { computeTaskScore } from '../services/prioritizer';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  // Interactive Algorithm Sandbox State
  const [sandboxSubject, setSandboxSubject] = useState('Computer Science');
  const [sandboxTitle, setSandboxTitle] = useState('Operating Systems Final Project');
  const [sandboxHoursLeft, setSandboxHoursLeft] = useState(18);
  const [sandboxImportance, setSandboxImportance] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Critical');
  const [sandboxDifficulty, setSandboxDifficulty] = useState<'Easy' | 'Medium' | 'Hard' | 'Very Hard'>('Hard');
  const [sandboxDuration, setSandboxDuration] = useState(90);

  // Compute live sandbox score
  const mockDeadline = new Date(Date.now() + sandboxHoursLeft * 3600000).toISOString();
  const sandboxResult = computeTaskScore({
    deadline: mockDeadline,
    importance: sandboxImportance,
    difficulty: sandboxDifficulty,
    estimatedDuration: sandboxDuration,
  });

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 selection:bg-purple-100 selection:text-purple-900">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        {/* Soft atmospheric gradient background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-tr from-purple-200/40 via-indigo-100/30 to-blue-100/30 blur-3xl -z-10 rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 border border-purple-200/60 rounded-full text-xs font-semibold text-purple-700">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI-Powered Academic Task Prioritizer</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1] text-balance">
                Study Smarter.{' '}
                <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Achieve More.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Your personal AI study planner that transforms overwhelming deadlines into a clear,
                intelligent, and achievable daily study plan.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <button
                  onClick={() => onNavigate('signup')}
                  className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer group"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
                <a
                  href="#features"
                  className="w-full sm:w-auto px-6 py-3.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 rounded-xl font-semibold transition-colors text-center"
                >
                  Explore Features
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Explainable Multi-Factor Scoring</span>
                </div>
                <span>·</span>
                <div className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span>Integrated Daily Focus Streaks</span>
                </div>
              </div>
            </div>

            {/* Right Interactive Dashboard Preview */}
            <div className="lg:col-span-6 relative">
              <div className="relative mx-auto max-w-lg lg:max-w-none bg-white rounded-2xl shadow-xl border border-slate-200/90 p-5 space-y-4">
                {/* Header Strip */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs font-bold">
                      SF
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Today's Academic Priority</h4>
                      <p className="text-[11px] text-slate-500">Wednesday · 3.5 hrs Available</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/70 rounded-md">
                    Target: 85% On-Time
                  </span>
                </div>

                {/* Recommended Next Task Highlight Card */}
                <div className="p-3.5 bg-gradient-to-r from-purple-50/70 via-indigo-50/50 to-purple-50/70 rounded-xl border border-purple-200/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-purple-700 flex items-center gap-1 uppercase tracking-wider">
                      <Sparkles className="w-3 h-3 text-purple-600" />
                      Recommended Next Task
                    </span>
                    <span className="text-xs font-bold text-purple-900 font-mono-numbers">
                      Priority 94.5 / 100
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Operating Systems Virtual Memory Lab
                  </h3>
                  <p className="text-xs text-slate-600 leading-snug">
                    Deadline in 14 hours. Complete LRU replacement code during your first 90-minute study window.
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                    <span>CS 301</span>
                    <span>·</span>
                    <span>Critical Importance</span>
                    <span>·</span>
                    <span className="font-mono-numbers">90 mins</span>
                  </div>
                </div>

                {/* Upcoming Queue Preview */}
                <div className="space-y-2 pt-1">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Upcoming Queue
                  </div>

                  {/* Task item 1 */}
                  <div className="flex items-center justify-between p-2.5 bg-slate-50/80 rounded-lg border border-slate-100 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-amber-500" />
                      <div>
                        <div className="font-semibold text-slate-800">Multivariable Calculus Set 4</div>
                        <div className="text-[11px] text-slate-500">Mathematics · Due Tomorrow</div>
                      </div>
                    </div>
                    <span className="font-bold text-slate-700 font-mono-numbers bg-white px-2 py-0.5 rounded border border-slate-200">
                      82.0 pts
                    </span>
                  </div>

                  {/* Task item 2 */}
                  <div className="flex items-center justify-between p-2.5 bg-slate-50/80 rounded-lg border border-slate-100 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <div>
                        <div className="font-semibold text-slate-800">Electromagnetism Midterm Review</div>
                        <div className="text-[11px] text-slate-500">Physics · Due in 3 days</div>
                      </div>
                    </div>
                    <span className="font-bold text-slate-700 font-mono-numbers bg-white px-2 py-0.5 rounded border border-slate-200">
                      76.5 pts
                    </span>
                  </div>
                </div>

                {/* Mini Metric Strip */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <div className="text-xs text-slate-500">Daily Streak</div>
                    <div className="text-sm font-bold text-slate-800 font-mono-numbers">5 Days 🔥</div>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <div className="text-xs text-slate-500">Completion</div>
                    <div className="text-sm font-bold text-emerald-600 font-mono-numbers">86%</div>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <div className="text-xs text-slate-500">Study Points</div>
                    <div className="text-sm font-bold text-purple-600 font-mono-numbers">650 pts</div>
                  </div>
                </div>
              </div>

              {/* Floating Badge */}
              <div className="hidden sm:flex absolute -bottom-5 -left-5 bg-white rounded-xl shadow-lg border border-slate-200 p-3 items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Optimal Study Plan</div>
                  <div className="text-[11px] text-slate-500">Balanced with smart 15-min rest breaks</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Proof Metrics Strip */}
      <section className="border-y border-slate-200/80 bg-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono-numbers">
                +38%
              </div>
              <div className="text-xs font-medium text-slate-500 mt-1">
                Improvement in On-Time Submissions
              </div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono-numbers">
                4.2 hrs
              </div>
              <div className="text-xs font-medium text-slate-500 mt-1">
                Average Weekly Study Time Saved
              </div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono-numbers">
                100%
              </div>
              <div className="text-xs font-medium text-slate-500 mt-1">
                Explainable Multi-Factor AI Logic
              </div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono-numbers">
                12,000+
              </div>
              <div className="text-xs font-medium text-slate-500 mt-1">
                Coursework Sessions Planned
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Algorithm Sandbox Section */}
      <section id="prioritizer-sandbox" className="py-20 bg-slate-50/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
              Interactive Algorithm Demonstration
            </span>
            <h2 className="text-3xl font-bold text-slate-900 mt-3 text-balance">
              Test the Prioritization Engine Live
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Adjust urgency, importance, difficulty, and duration to see how our normalized mathematical formula calculates priority in real time.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Controls */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Task Title & Subject
                  </label>
                  <input
                    type="text"
                    value={sandboxTitle}
                    onChange={(e) => setSandboxTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-900"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>Hours Until Deadline</span>
                    <span className="font-mono-numbers text-purple-600 font-bold">
                      {sandboxHoursLeft} hours ({sandboxHoursLeft < 24 ? 'Urgent' : 'Manageable'})
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="120"
                    value={sandboxHoursLeft}
                    onChange={(e) => setSandboxHoursLeft(Number(e.target.value))}
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Importance
                    </label>
                    <select
                      value={sandboxImportance}
                      onChange={(e) => setSandboxImportance(e.target.value as any)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-900"
                    >
                      <option value="Low">Low (25 pts)</option>
                      <option value="Medium">Medium (50 pts)</option>
                      <option value="High">High (75 pts)</option>
                      <option value="Critical">Critical (100 pts)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Difficulty
                    </label>
                    <select
                      value={sandboxDifficulty}
                      onChange={(e) => setSandboxDifficulty(e.target.value as any)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-900"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                      <option value="Very Hard">Very Hard</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>Estimated Duration</span>
                    <span className="font-mono-numbers text-purple-600 font-bold">
                      {sandboxDuration} mins
                    </span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="240"
                    step="15"
                    value={sandboxDuration}
                    onChange={(e) => setSandboxDuration(Number(e.target.value))}
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                </div>
              </div>

              {/* Live Output Card */}
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 flex flex-col items-center justify-center text-center space-y-4">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Computed Priority Score
                </span>

                <div className="text-5xl font-black text-purple-700 font-mono-numbers">
                  {sandboxResult.priorityScore}
                  <span className="text-lg font-medium text-slate-400 ml-1">/ 100</span>
                </div>

                {/* Breakdown meters */}
                <div className="w-full space-y-2 text-left text-xs pt-2">
                  <div className="flex justify-between text-slate-600">
                    <span>Deadline Urgency (40%)</span>
                    <span className="font-bold font-mono-numbers">
                      {sandboxResult.breakdown.urgencyScore}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full transition-all duration-300"
                      style={{ width: `${sandboxResult.breakdown.urgencyScore}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>Importance (30%)</span>
                    <span className="font-bold font-mono-numbers">
                      {sandboxResult.breakdown.importanceScore}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-300"
                      style={{ width: `${sandboxResult.breakdown.importanceScore}%` }}
                    />
                  </div>
                </div>

                <p className="text-xs text-slate-600 italic px-2 pt-2 border-t border-slate-200/80">
                  "{sandboxResult.breakdown.explanation}"
                </p>

                <button
                  onClick={() => onNavigate('signup')}
                  className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  Create Your Schedule With This Algorithm
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
              Built for High-Performing College Students
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-3 text-balance">
              Everything You Need to Conquer Semester Workload
            </h2>
            <p className="text-sm text-slate-600 mt-3">
              Eliminate decision fatigue and know exactly what to study next.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl border border-slate-200 hover:border-purple-200 hover:shadow-xs transition-all bg-white space-y-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Explainable Multi-Factor Prioritizer</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Prioritizes tasks using deadline proximity, importance weight, cognitive difficulty, and study session fit. You always know why a task is recommended first.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl border border-slate-200 hover:border-purple-200 hover:shadow-xs transition-all bg-white space-y-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Dynamic Daily Study Timelines</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Generates timed study blocks and restorative breaks based on your actual availability. Detects workload overload before you burn out.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl border border-slate-200 hover:border-purple-200 hover:shadow-xs transition-all bg-white space-y-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Academic Analytics & Motivation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Track weekly study hours, on-time completion rates, and subject balance. Earn streak milestones and honors badges as you conquer deadlines.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-slate-50/60 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
              Three Seamless Steps
            </span>
            <h2 className="text-3xl font-bold text-slate-900 mt-3 text-balance">
              How StudyFlow AI Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white font-bold flex items-center justify-center text-xs font-mono-numbers">
                01
              </div>
              <h3 className="text-base font-bold text-slate-900">Input Your Coursework</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Add assignments, upcoming examinations, and project milestones with their deadlines, subject, and estimated duration.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-purple-600 text-white font-bold flex items-center justify-center text-xs font-mono-numbers">
                02
              </div>
              <h3 className="text-base font-bold text-slate-900">AI Calculates Priority Scores</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                The algorithm normalizes deadline urgency, importance, difficulty, and available study hours to assign a transparent 0–100 rank.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs font-mono-numbers">
                03
              </div>
              <h3 className="text-base font-bold text-slate-900">Follow Your Daily Timeline</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Launch deep work sessions with the integrated Pomodoro focus timer, recharge during structured breaks, and check off finished work.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-8 sm:p-12 text-center text-white space-y-6 shadow-xl">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-balance">
              Take Control of Your Academic Calendar Today
            </h2>
            <p className="text-slate-300 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
              Join thousands of college students who stopped cramming at 2 AM and started studying with clarity and confidence.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('signup')}
                className="px-8 py-3.5 bg-white text-purple-950 font-bold rounded-xl hover:bg-slate-100 transition-all shadow-md hover:shadow-lg cursor-pointer inline-flex items-center gap-2"
              >
                <span>Get Started for Free</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-purple-600 text-white flex items-center justify-center text-xs font-bold">
              SF
            </div>
            <span className="font-semibold text-slate-700">StudyFlow AI</span>
            <span>·</span>
            <span>Intelligent Academic Workload Management</span>
          </div>
          <div>
            Built with modern React, TypeScript, FastAPI, and mathematical task prioritization.
          </div>
        </div>
      </footer>
    </div>
  );
};
