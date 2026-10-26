import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Lock,
  Clock,
  Award,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Bell,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Achievement, StudyPreferences } from '../types';

export const SettingsPage: React.FC = () => {
  const { user, logout, refreshUser } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [preferences, setPreferences] = useState<StudyPreferences | null>(null);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Preference state
  const [availMinutes, setAvailMinutes] = useState(180);
  const [sessionMinutes, setSessionMinutes] = useState(45);
  const [breakMinutes, setBreakMinutes] = useState(15);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [prefSaved, setPrefSaved] = useState(false);

  // Seed state
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [achRes, prefRes] = await Promise.all([
        api.getAchievements(),
        api.getPreferences(),
      ]);
      setAchievements(achRes.achievements);
      const p = prefRes.preferences;
      if (p) {
        setPreferences(p);
        setAvailMinutes(p.dailyAvailableMinutes || 180);
        setSessionMinutes(p.preferredSessionMinutes || 45);
        setBreakMinutes(p.breakDurationMinutes || 15);
        setStartTime(p.preferredStartTime || '09:00');
        setEndTime(p.preferredEndTime || '17:00');
      }
    } catch (err) {
      console.error('Settings load error:', err);
    }
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updatePreferences({
        dailyAvailableMinutes: availMinutes,
        preferredSessionMinutes: sessionMinutes,
        breakDurationMinutes: breakMinutes,
        preferredStartTime: startTime,
        preferredEndTime: endTime,
      });
      setPrefSaved(true);
      setTimeout(() => setPrefSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save preferences:', err);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg({ type: '', text: '' });
    if (!currentPassword || !newPassword) return;
    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 6 characters' });
      return;
    }

    try {
      setPasswordLoading(true);
      await api.changePassword({ currentPassword, newPassword });
      setPasswordMsg({ type: 'success', text: 'Password changed successfully' });
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setPasswordMsg({ type: 'error', text: err.message || 'Failed to update password' });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSeedCoursework = async () => {
    try {
      setSeeding(true);
      const res = await api.seedDemoData();
      await refreshUser();
      await loadSettings();
      setSeedMsg(`Loaded ${res.count} realistic coursework assignments and exam deadlines!`);
      setTimeout(() => setSeedMsg(''), 4000);
    } catch (err: any) {
      setSeedMsg('Failed to seed demo coursework');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200/80">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Student Settings</h1>
        <p className="text-xs text-slate-500">
          Manage your account, study preferences, security, and achievement milestones.
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <UserIcon className="w-4 h-4 text-purple-600" />
          <span>Student Profile</span>
        </h3>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <img
            src={user?.avatarUrl || '/src/assets/images/avatar_student_default_1792947626134.jpg'}
            alt="Student Avatar"
            className="w-14 h-14 rounded-full object-cover border-2 border-purple-200"
          />
          <div>
            <div className="text-base font-bold text-slate-900">{user?.fullName}</div>
            <div className="text-xs text-slate-500">{user?.email}</div>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-600">
              <span className="font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                {user?.points || 100} Total Points
              </span>
              <span>·</span>
              <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/50">
                {user?.streakDays || 1} Day Streak 🔥
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Study Availability & Scheduler Preferences */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>Study Availability & Scheduler Defaults</span>
          </h3>
          {prefSaved && (
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Preferences Saved
            </span>
          )}
        </div>

        <form onSubmit={handleSavePreferences} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Daily Study Time (minutes)
              </label>
              <input
                type="number"
                min="30"
                max="600"
                step="15"
                value={availMinutes}
                onChange={(e) => setAvailMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono-numbers"
              />
              <span className="text-[11px] text-slate-400">
                Used to calculate task session time fit ({Math.floor(availMinutes / 60)}h {availMinutes % 60}m)
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Preferred Focus Block Length
              </label>
              <select
                value={sessionMinutes}
                onChange={(e) => setSessionMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              >
                <option value={25}>25 minutes (Pomodoro technique)</option>
                <option value={45}>45 minutes (Optimal concentration)</option>
                <option value={60}>60 minutes (Deep work block)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Typical Study Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Typical Study End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            Save Study Preferences
          </button>
        </form>
      </div>

      {/* Gamification Achievements Unlocked */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Award className="w-4 h-4 text-purple-600" />
          <span>Earned Academic Badges & Milestones</span>
        </h3>

        {achievements.length === 0 ? (
          <p className="text-xs text-slate-500">No achievements unlocked yet. Complete tasks to earn points!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {achievements.map((ach) => (
              <div
                key={ach.id}
                className="p-3.5 bg-purple-50/50 rounded-xl border border-purple-100 flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">{ach.title}</div>
                  <div className="text-[11px] text-slate-500 leading-tight">{ach.description}</div>
                  <div className="text-[10px] text-purple-700 font-semibold font-mono-numbers mt-1">
                    +{ach.points} points · {new Date(ach.earnedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Change Password Form */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Lock className="w-4 h-4 text-slate-600" />
          <span>Security & Password</span>
        </h3>

        {passwordMsg.text && (
          <div
            className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
              passwordMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {passwordMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{passwordMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-3 max-w-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
            />
          </div>

          <button
            type="submit"
            disabled={passwordLoading}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {passwordLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Demo Coursework Seeder */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <RotateCcw className="w-4 h-4 text-purple-600" />
          <span>Demo Data Management</span>
        </h3>
        <p className="text-xs text-slate-500">
          Reset or populate realistic university tasks (Operating Systems, Multivariable Calculus, Physics Exam, Capstone Project) to evaluate the AI prioritizer.
        </p>

        {seedMsg && (
          <div className="p-3 bg-purple-50 text-purple-800 border border-purple-200 rounded-lg text-xs">
            {seedMsg}
          </div>
        )}

        <button
          onClick={handleSeedCoursework}
          disabled={seeding}
          className="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${seeding ? 'animate-spin' : ''}`} />
          <span>{seeding ? 'Loading Sample Coursework...' : 'Populate Sample University Tasks'}</span>
        </button>
      </div>

      {/* Logout */}
      <div className="pt-2">
        <button
          onClick={logout}
          className="px-4 py-2.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out of StudyFlow AI</span>
        </button>
      </div>
    </div>
  );
};
