'use client';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useTasks } from '@/hooks/useTasks';
import StatCard from '@/components/dashboard/StatCard';
import ActivityChart from '@/components/dashboard/ActivityChart';
import SubjectBreakdown from '@/components/dashboard/SubjectBreakdown';
import RecentTasks from '@/components/dashboard/RecentTasks';
import PomodoroWidget from '@/components/pomodoro/PomodoroWidget';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import { BookOpen, CheckCircle2, Clock3, ClipboardList } from 'lucide-react';

export default function DashboardPage() {
  const { summary: summaryQuery, daily: activityQuery, subjects: subjectsQuery } = useAnalytics(30);
  const { data: tasksData } = useTasks({ status: 'todo' });

  const summary = summaryQuery.data;
  const summaryLoading = summaryQuery.isLoading;

  return (
    <div className="space-y-6">
      <ErrorBoundary fallbackTitle="Could not load Pomodoro widget">
        <PomodoroWidget />
      </ErrorBoundary>

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-100 sm:text-3xl">
          Dashboard
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Your study overview at a glance
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Tasks Pending"
          value={
            summaryLoading
              ? '...'
              : String(
                  summary?.taskStats?.find((s: { _id: string }) => s._id === 'todo')?.count ?? 0
                )
          }
          icon={ClipboardList}
          color="blue"
        />
        <StatCard
          title="Tasks Completed"
          value={
            summaryLoading
              ? '...'
              : String(
                  summary?.taskStats?.find((s: { _id: string }) => s._id === 'completed')?.count ??
                    0
                )
          }
          icon={CheckCircle2}
          color="green"
        />
        <StatCard
          title="Active Plans"
          value={
            summaryLoading
              ? '...'
              : String(
                  summary?.planStats?.find((s: { _id: string }) => s._id === 'active')?.count ?? 0
                )
          }
          icon={BookOpen}
          color="violet"
        />
        <StatCard
          title="Hours Studied"
          value={
            summaryLoading
              ? '...'
              : String(
                  Math.round(
                    summary?.planStats?.reduce(
                      (acc: number, s: { totalCompletedHours: number }) =>
                        acc + s.totalCompletedHours,
                      0
                    ) ?? 0
                  )
                )
          }
          icon={Clock3}
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ErrorBoundary fallbackTitle="Could not load activity chart">
            <ActivityChart data={activityQuery.data ?? []} />
          </ErrorBoundary>
        </div>
        <ErrorBoundary fallbackTitle="Could not load subject breakdown">
          <SubjectBreakdown data={subjectsQuery.data ?? []} />
        </ErrorBoundary>
      </div>

      <ErrorBoundary fallbackTitle="Could not load recent tasks">
        <RecentTasks tasks={tasksData ?? []} />
      </ErrorBoundary>
    </div>
  );
}
