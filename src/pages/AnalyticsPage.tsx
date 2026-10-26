import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  CheckCircle2,
  Clock,
  Award,
  BookOpen,
  Calendar,
  Layers,
} from 'lucide-react';
import { api } from '../services/api';
import { Task } from '../types';

interface AnalyticsPageProps {
  tasks: Task[];
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ tasks }) => {
  const [data, setData] = useState<{
    metrics: {
      totalTasks: number;
      completedTasks: number;
      pendingTasks: number;
      overdueTasks: number;
      todayStudyHours: number;
      weeklyStudyHours: number;
      completionRate: number;
      onTimeRate: number;
    };
    weeklyChartData: Array<{ day: string; hours: number }>;
    subjectChartData: Array<{ subject: string; total: number; completed: number; progress: number }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const res = await api.getAnalytics();
        setData(res);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    loadAnalytics();
  }, [tasks]);

  if (loading || !data) {
    return (
      <div className="space-y-6 pb-12">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-28 bg-white rounded-xl border border-slate-200 animate-pulse" />
          ))}
        </div>
        <div className="h-72 bg-white rounded-2xl border border-slate-200 animate-pulse" />
      </div>
    );
  }

  const { metrics, weeklyChartData, subjectChartData } = data;

  // Donut chart data for Completed vs Pending
  const donutData = [
    { name: 'Completed', value: metrics.completedTasks || 0, color: '#10b981' },
    { name: 'Pending', value: metrics.pendingTasks || 0, color: '#6366f1' },
    { name: 'Overdue', value: metrics.overdueTasks || 0, color: '#f43f5e' },
  ].filter((d) => d.value > 0);

  // If no tasks exist, provide fallback clean empty state
  const hasData = metrics.totalTasks > 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200/80">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Academic Analytics</h1>
        <p className="text-xs text-slate-500">
          Real-time metrics, weekly study consistency, and subject workload balance.
        </p>
      </div>

      {/* 4 Primary Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 flex items-center justify-between">
            <span>Weekly Study Hours</span>
            <Clock className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono-numbers mt-1">
            {metrics.weeklyStudyHours} hrs
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Across last 7 days</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 flex items-center justify-between">
            <span>On-Time Rate</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 font-mono-numbers mt-1">
            {metrics.onTimeRate}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Submissions before deadline</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 flex items-center justify-between">
            <span>Completion Ratio</span>
            <CheckCircle2 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-indigo-600 font-mono-numbers mt-1">
            {metrics.completionRate}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {metrics.completedTasks} of {metrics.totalTasks} milestones done
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 flex items-center justify-between">
            <span>Workload Balance</span>
            <Layers className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-800 font-mono-numbers mt-1">
            {subjectChartData.length} Subjects
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Active semester courses</div>
        </div>
      </div>

      {!hasData ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <BarChart3 className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">Not enough data to graph</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Log coursework or click 'Load Demo Coursework' in the dashboard to populate these charts with realistic university academic records.
          </p>
        </div>
      ) : (
        <>
          {/* Charts Row 1: Weekly Study Hours Bar Chart & Task Breakdown Donut */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Weekly Study Hours Bar Chart */}
            <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Weekly Study Volume</h3>
                  <p className="text-xs text-slate-500">Daily study hours logged over the last 7 days</p>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-700">
                  Target: 3.5h / day
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyChartData}>
                    <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={12}
                      tickLine={false}
                      unit="h"
                      domain={[0, 'auto']}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-md font-mono-numbers">
                              {payload[0].payload.day}: {payload[0].value} hours
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="hours" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Task Status Donut Chart */}
            <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Task Status Distribution</h3>
                <p className="text-xs text-slate-500">Breakdown of active vs completed work</p>
              </div>

              <div className="h-52 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={4}
                    >
                      {donutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-center gap-4 text-xs">
                {donutData.map((item) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-slate-600 font-medium">
                      {item.name} ({item.value})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Charts Row 2: Subject-Wise Progress Bars */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Subject-Wise Completion Progress</h3>
              <p className="text-xs text-slate-500">
                Coursework completion percentage per enrolled academic discipline
              </p>
            </div>

            <div className="space-y-4 pt-1">
              {subjectChartData.map((subj) => (
                <div key={subj.subject} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{subj.subject}</span>
                    <span className="text-slate-500 font-mono-numbers">
                      {subj.completed} / {subj.total} completed ({subj.progress}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${subj.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
