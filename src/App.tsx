import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { DashboardPage } from './pages/DashboardPage';
import { TasksPage } from './pages/TasksPage';
import { PlannerPage } from './pages/PlannerPage';
import { CalendarPage } from './pages/CalendarPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { SubjectsPage } from './pages/SubjectsPage';
import { TaskModal } from './components/TaskModal';
import { SubjectModal } from './components/SubjectModal';
import { AIInsightModal } from './components/AIInsightModal';
import { WeightsModal } from './components/WeightsModal';
import { FocusTimerModal } from './components/FocusTimerModal';
import { Task, PriorityWeights, Subject } from './types';
import { api } from './services/api';
import { DEFAULT_PRIORITY_WEIGHTS } from './services/prioritizer';
import { Menu, Plus, Sliders, Bell } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [explainingTask, setExplainingTask] = useState<Task | null>(null);
  const [isWeightsModalOpen, setIsWeightsModalOpen] = useState(false);
  const [focusTask, setFocusTask] = useState<Task | null>(null);

  // Global algorithm weights
  const [weights, setWeights] = useState<PriorityWeights>(DEFAULT_PRIORITY_WEIGHTS);

  // Global tasks and subjects store
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const loadGlobalTasks = async () => {
    if (!user) return;
    try {
      const res = await api.getTasks();
      setTasks(res.tasks);
    } catch (err) {
      console.error('Error fetching global tasks:', err);
    }
  };

  const loadSubjects = async () => {
    if (!user) return;
    try {
      const res = await api.getSubjects();
      setSubjects(res.subjects);
    } catch (err) {
      console.error('Error fetching subjects:', err);
    }
  };

  useEffect(() => {
    if (user) {
      loadGlobalTasks();
      loadSubjects();
    }
  }, [user]);

  // Synchronize landing / dashboard route on auth change
  useEffect(() => {
    if (!isLoading) {
      if (user && (currentPage === 'login' || currentPage === 'signup')) {
        setCurrentPage('dashboard');
      }
    }
  }, [user, isLoading]);

  const handleOpenAddTask = () => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleOpenAddSubject = () => {
    setEditingSubject(null);
    setIsSubjectModalOpen(true);
  };

  const handleEditSubject = (subj: Subject) => {
    setEditingSubject(subj);
    setIsSubjectModalOpen(true);
  };

  const handleSaveSubject = async (subjectData: {
    name: string;
    code?: string;
    credits: number;
    color?: string;
    semester?: string;
  }) => {
    if (editingSubject) {
      await api.updateSubject(editingSubject.id, subjectData);
    } else {
      await api.createSubject(subjectData);
    }
    await loadSubjects();
    await loadGlobalTasks();
  };

  const handleDeleteSubject = async (subjectId: string) => {
    await api.deleteSubject(subjectId);
    await loadSubjects();
    await loadGlobalTasks();
  };

  const handleAddTaskForSubject = (subjectName: string, subjectId: string, credits: number) => {
    setEditingTask({
      id: '',
      userId: user?.id || '',
      title: '',
      description: '',
      subject: subjectName,
      subjectId,
      credits,
      category: 'Assignment',
      deadline: new Date(Date.now() + 86400000).toISOString(),
      importance: 'Medium',
      difficulty: 'Medium',
      estimatedDuration: 60,
      remainingDuration: 60,
      status: 'Pending',
      priorityScore: 50,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = async (taskData: Partial<Task>) => {
    if (editingTask && editingTask.id) {
      await api.updateTask(editingTask.id, taskData);
    } else {
      await api.createTask(taskData);
    }
    await loadGlobalTasks();
  };

  const handleFocusTaskCompleted = async (task: Task) => {
    await api.updateTask(task.id, { status: 'Completed' });
    await loadGlobalTasks();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500">Initializing StudyFlow AI...</span>
        </div>
      </div>
    );
  }

  // Public Pages (Landing, Login, Signup)
  if (!user && (currentPage === 'landing' || currentPage === 'login' || currentPage === 'signup')) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans">
        <Navbar onNavigate={setCurrentPage} currentPage={currentPage} />

        <main className="flex-1">
          {currentPage === 'landing' && <LandingPage onNavigate={setCurrentPage} />}
          {currentPage === 'login' && <LoginPage onNavigate={setCurrentPage} />}
          {currentPage === 'signup' && <SignupPage onNavigate={setCurrentPage} />}
        </main>
      </div>
    );
  }

  // If user navigated to landing page while logged in
  if (currentPage === 'landing') {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans">
        <Navbar onNavigate={setCurrentPage} currentPage={currentPage} />
        <main className="flex-1">
          <LandingPage onNavigate={setCurrentPage} />
        </main>
      </div>
    );
  }

  // Workspace Layout for Authenticated Student
  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col lg:flex-row font-sans text-slate-900">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenAddTask={handleOpenAddTask}
        isOpenMobile={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Viewport Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Workspace Top Bar Contract (Breadcrumbs & Profile) */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb Trail */}
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 truncate">
              <span>StudyFlow</span>
              <span>/</span>
              <span className="font-semibold text-slate-900 capitalize">
                {currentTab === 'subjects'
                  ? 'Semester Subjects & Credits'
                  : currentTab === 'tasks'
                  ? 'Task Manager'
                  : currentTab === 'planner'
                  ? 'Study Schedule'
                  : currentTab}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Quick Curriculum Action */}
            <button
              onClick={handleOpenAddSubject}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
              title="Add Semester Subject & Credits"
            >
              <Plus className="w-3.5 h-3.5 text-purple-600" />
              <span>Add Subject</span>
            </button>

            {/* Tune Weights Quick Action */}
            <button
              onClick={() => setIsWeightsModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
              title="Tune Algorithm Weights"
            >
              <Sliders className="w-3.5 h-3.5 text-purple-600" />
              <span>Weights</span>
            </button>

            {/* Quick Add Button */}
            <button
              onClick={handleOpenAddTask}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Task</span>
            </button>

            {/* User Avatar */}
            <div className="w-8 h-8 rounded-full border border-slate-200 overflow-hidden shrink-0">
              <img
                src={user?.avatarUrl || '/src/assets/images/avatar_student_default_1792947626134.jpg'}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </header>

        {/* Workspace Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardPage
              onOpenAddTask={handleOpenAddTask}
              onEditTask={handleEditTask}
              onOpenExplain={(t) => setExplainingTask(t)}
              onStartFocus={(t) => setFocusTask(t)}
              onNavigateTab={setCurrentTab}
              subjects={subjects}
              onOpenAddSubject={handleOpenAddSubject}
              onOpenEditSubject={handleEditSubject}
              onRefreshSubjects={loadSubjects}
            />
          )}

          {currentTab === 'subjects' && (
            <SubjectsPage
              subjects={subjects}
              tasks={tasks}
              onOpenAddSubject={handleOpenAddSubject}
              onEditSubject={handleEditSubject}
              onDeleteSubject={handleDeleteSubject}
              onAddTaskForSubject={handleAddTaskForSubject}
            />
          )}

          {currentTab === 'tasks' && (
            <TasksPage
              onOpenAddTask={handleOpenAddTask}
              onEditTask={handleEditTask}
              onOpenExplain={(t) => setExplainingTask(t)}
              onOpenWeights={() => setIsWeightsModalOpen(true)}
              onOpenAddSubject={handleOpenAddSubject}
              subjects={subjects}
              weights={weights}
            />
          )}

          {currentTab === 'planner' && (
            <PlannerPage
              onStartFocus={(t) => setFocusTask(t)}
              allTasks={tasks}
              weights={weights}
            />
          )}

          {currentTab === 'calendar' && (
            <CalendarPage
              tasks={tasks}
              onSelectTask={(t) => setExplainingTask(t)}
              onOpenAddTask={handleOpenAddTask}
            />
          )}

          {currentTab === 'analytics' && <AnalyticsPage tasks={tasks} />}

          {currentTab === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Global Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        initialTask={editingTask}
        subjects={subjects}
        onOpenAddSubject={handleOpenAddSubject}
      />

      <SubjectModal
        isOpen={isSubjectModalOpen}
        onClose={() => {
          setIsSubjectModalOpen(false);
          setEditingSubject(null);
        }}
        onSave={handleSaveSubject}
        initialSubject={editingSubject}
      />

      <AIInsightModal
        isOpen={!!explainingTask}
        onClose={() => setExplainingTask(null)}
        task={explainingTask}
      />

      <WeightsModal
        isOpen={isWeightsModalOpen}
        onClose={() => setIsWeightsModalOpen(false)}
        weights={weights}
        onSaveWeights={(newWeights) => setWeights(newWeights)}
      />

      <FocusTimerModal
        isOpen={!!focusTask}
        onClose={() => setFocusTask(null)}
        task={focusTask}
        onTaskCompleted={handleFocusTaskCompleted}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
