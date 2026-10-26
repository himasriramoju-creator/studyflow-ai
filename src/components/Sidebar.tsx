import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Sparkles,
  Calendar,
  BarChart3,
  Settings,
  LogOut,
  Flame,
  Award,
  Plus,
  BookOpen,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenAddTask: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenAddTask,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'subjects', label: 'Subjects & Credits', icon: GraduationCap },
    { id: 'tasks', label: 'My Tasks', icon: CheckSquare },
    { id: 'planner', label: 'AI Study Planner', icon: Sparkles },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'analytics', label: 'Study Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const content = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 w-64 select-none">
      {/* Brand Header */}
      <div className="p-5 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <span className="text-base font-bold text-slate-900 tracking-tight">StudyFlow</span>
            <span className="text-xs font-semibold text-purple-600 ml-1">AI</span>
          </div>
        </div>
      </div>

      {/* Quick Add Task Action */}
      <div className="p-4 pb-2">
        <button
          onClick={() => {
            onOpenAddTask();
            if (onCloseMobile) onCloseMobile();
          }}
          className="w-full py-2.5 px-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg text-sm font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-xs hover:shadow flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Quick Add Task</span>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectTab(item.id);
                if (onCloseMobile) onCloseMobile();
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors text-left cursor-pointer ${
                isActive
                  ? 'bg-purple-50 text-purple-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-purple-600' : 'text-slate-500'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Student Progress / Gamification Summary */}
      <div className="p-4 mx-3 mb-3 bg-slate-50/80 rounded-xl border border-slate-200/70">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <span>Student Momentum</span>
          <span className="font-semibold text-slate-700 font-mono-numbers">
            {user?.points ?? 100} pts
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-1 rounded-md border border-amber-200/50">
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="font-mono-numbers">{user?.streakDays || 1}d Streak</span>
          </div>
          <div className="flex items-center gap-1 text-xs font-medium text-purple-700 bg-purple-50 px-2 py-1 rounded-md border border-purple-200/50">
            <Award className="w-3.5 h-3.5 text-purple-500" />
            <span>Honors</span>
          </div>
        </div>
      </div>

      {/* User Footer & Logout */}
      <div className="p-3 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src={user?.avatarUrl || '/src/assets/images/avatar_student_default_1792947626134.jpg'}
            alt="Student Avatar"
            className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
          />
          <div className="truncate">
            <p className="text-xs font-semibold text-slate-800 truncate">{user?.fullName || 'Student'}</p>
            <p className="text-[11px] text-slate-400 truncate">{user?.email || 'student@edu'}</p>
          </div>
        </div>
        <button
          onClick={logout}
          title="Sign out"
          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block h-screen sticky top-0 shrink-0 z-30">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative z-10">{content}</div>
        </div>
      )}
    </>
  );
};
