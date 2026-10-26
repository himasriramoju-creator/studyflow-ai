import React, { useState } from 'react';
import { Eye, EyeOff, Sparkles, ArrowRight, AlertCircle, BookOpen, UserCheck, CheckCircle2, ShieldCheck, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LoginPageProps {
  onNavigate: (page: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login, demoLogin, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [canReset, setCanReset] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCanReset(false);
    setLoading(true);
    try {
      await login(email.trim(), password);
      onNavigate('dashboard');
    } catch (err: any) {
      const msg = err.message || 'Invalid email or password';
      setError(msg);
      if (msg.toLowerCase().includes('incorrect password')) {
        setCanReset(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInstantPasswordReset = async () => {
    if (!email || !password) {
      setError('Please provide your email and new password');
      return;
    }
    setResetLoading(true);
    setError('');
    try {
      await resetPassword(email.trim(), password);
      setResetSuccess(true);
      setTimeout(() => {
        onNavigate('dashboard');
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
    } finally {
      setResetLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setDemoLoading(true);
    try {
      await demoLogin();
      onNavigate('dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to initialize demo account');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center">
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left Form Area */}
        <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 xl:px-24">
          <div className="max-w-sm w-full mx-auto">
            {/* Brand Logo */}
            <button
              onClick={() => onNavigate('landing')}
              className="flex items-center gap-2 mb-8 cursor-pointer text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                StudyFlow<span className="text-purple-600">.ai</span>
              </span>
            </button>

            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Student Login</h1>
            <p className="mt-1 text-xs text-slate-500">
              Sign in with your personal or college email to access and save your study history.
            </p>

            {/* Quick Demo Student Button */}
            <div className="mt-5 p-3 bg-purple-50/80 border border-purple-200/60 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  Quick Evaluation Demo?
                </span>
                <span className="text-[10px] uppercase font-semibold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">
                  Instant Test
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mb-2.5">
                Explore with pre-seeded university assignments, exams, and analytics in 1 click.
              </p>
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={demoLoading}
                className="w-full py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>{demoLoading ? 'Launching Demo...' : '1-Click Demo Student Sign In'}</span>
              </button>
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs text-slate-400">
                <span className="px-3 bg-white">or sign in with personal email</span>
              </div>
            </div>

            {/* Success alert */}
            {resetSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>Password updated! Redirecting to your dashboard...</span>
              </div>
            )}

            {/* Error & Password Reset Banner */}
            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 space-y-2">
                <div className="flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
                {canReset && (
                  <div className="pt-1 border-t border-rose-200/60">
                    <button
                      type="button"
                      onClick={handleInstantPasswordReset}
                      disabled={resetLoading}
                      className="w-full py-1.5 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>{resetLoading ? 'Updating...' : 'Set Entered Password & Sign In'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Personal or College Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. himasriramoju@gmail.com"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all text-slate-900"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">Password</label>
                  <span className="text-[11px] text-slate-400">
                    Auto-saves your study records
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all text-slate-900 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                  />
                  <label htmlFor="remember" className="ml-2 text-xs text-slate-600 cursor-pointer">
                    Remember me
                  </label>
                </div>

                <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  History Protected
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg text-sm font-semibold shadow-xs hover:shadow transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{loading ? 'Logging in...' : 'Sign In with Personal Email'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-4 p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-[11px] text-slate-500 leading-relaxed">
              💡 <strong>Seamless Account Access:</strong> If this is your first time signing in with this email, StudyFlow AI will automatically create your secure personal account and save all your tasks, deadlines, and study history.
            </div>

            <p className="mt-5 text-center text-xs text-slate-500">
              Want to customize your profile name?{' '}
              <button
                onClick={() => onNavigate('signup')}
                className="font-semibold text-purple-600 hover:text-purple-700 cursor-pointer"
              >
                Register with Full Name
              </button>
            </p>
          </div>
        </div>

        {/* Right Editorial Showcase Area */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden items-center justify-center p-12">
          <img
            src="/src/assets/images/auth_study_workspace_1792947626816.jpg"
            alt="Study Workspace"
            className="absolute inset-0 w-full h-full object-cover opacity-60"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-slate-950/30" />

          <div className="relative z-10 max-w-md text-white space-y-4">
            <span className="text-xs font-bold text-purple-300 bg-purple-900/60 px-3 py-1 rounded-full border border-purple-500/40">
              Personal Academic Vault
            </span>
            <h2 className="text-3xl font-extrabold leading-tight">
              Organize deadlines, prioritize with clarity, and protect your study history.
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              "Logging in with my personal Gmail keeps all my tasks synchronized and preserves my completion streak across every semester session."
            </p>
            <div className="pt-2 text-xs text-slate-400">
              <span className="font-semibold text-white">StudyFlow AI</span> · Persistent Personal Task History
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
