'use client';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  ClipboardList,
  Plus,
  Sparkles,
} from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useTasks } from '@/hooks/useTasks';
import { useAuthStore } from '@/store/authStore';
import StatCard from '@/components/dashboard/StatCard';
import ActivityChart from '@/components/dashboard/ActivityChart';
import SubjectBreakdown from '@/components/dashboard/SubjectBreakdown';
import RecentTasks from '@/components/dashboard/RecentTasks';
import PomodoroWidget from '@/components/pomodoro/PomodoroWidget';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import LoadingState from '@/components/ui/LoadingState';
import QueryError from '@/components/ui/QueryError';

export default function DashboardPage() {
  const { summary: summaryQuery, daily: activityQuery, subjects: subjectsQuery } = useAnalytics(30);
  const tasksQuery = useTasks({ status: 'todo' });
  const user = useAuthStore((state) => state.user);
  const summary = summaryQuery.data;
  const firstName = user?.name?.trim().split(/\s+/)[0];
  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="eyebrow mb-2">Your learning, in focus</p>
          <h1 className="page-title">
            Welcome back{firstName ? `, ${firstName}` : ''}
            <span className="text-indigo-500">.</span>
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            A fresh opportunity to make a little more progress.
          </p>
        </div>
        <Link href="/study-plans" className="btn-primary self-start">
          <Plus className="h-4 w-4" />
          Plan your studies
        </Link>
      </div>
      <section className="relative overflow-hidden rounded-2xl bg-indigo-600 p-6 text-white sm:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-28 h-80 w-80 rounded-full border-[48px] border-white/5"
        />
        <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-medium text-indigo-100">
              <Sparkles className="h-4 w-4" />A little structure goes a long way
            </div>
            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Big goals start with a small next step.
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-indigo-100">
              Choose a task, clear the distractions, and give it your full attention.
            </p>
          </div>
          <Link
            href="/tasks"
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50 sm:self-center"
          >
            Find your next task
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
      {summaryQuery.isPending ? (
        <LoadingState variant="stats" count={4} />
      ) : summaryQuery.isError ? (
        <QueryError
          title="Your study overview is unavailable"
          onRetry={() => {
            void summaryQuery.refetch();
          }}
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          <StatCard
            title="Tasks Pending"
            value={String(summary?.taskStats.find((s) => s._id === 'todo')?.count ?? 0)}
            icon={ClipboardList}
            color="blue"
          />
          <StatCard
            title="Tasks Completed"
            value={String(summary?.taskStats.find((s) => s._id === 'completed')?.count ?? 0)}
            icon={CheckCircle2}
            color="green"
          />
          <StatCard
            title="Active Plans"
            value={String(summary?.planStats.find((s) => s._id === 'active')?.count ?? 0)}
            icon={BookOpen}
            color="violet"
          />
          <StatCard
            title="Hours Studied"
            value={String(
              Math.round(summary?.planStats.reduce((acc, s) => acc + s.totalCompletedHours, 0) ?? 0)
            )}
            icon={Clock3}
            color="amber"
          />
        </div>
      )}
      <div className="grid min-w-0 gap-6 xl:grid-cols-3">
        <div className="min-w-0 xl:col-span-2">
          <ErrorBoundary fallbackTitle="Could not load activity chart">
            {activityQuery.isPending ? (
              <LoadingState />
            ) : activityQuery.isError ? (
              <QueryError
                onRetry={() => {
                  void activityQuery.refetch();
                }}
              />
            ) : (
              <ActivityChart data={activityQuery.data ?? []} />
            )}
          </ErrorBoundary>
        </div>
        <ErrorBoundary fallbackTitle="Could not load subject breakdown">
          {subjectsQuery.isPending ? (
            <LoadingState />
          ) : subjectsQuery.isError ? (
            <QueryError
              onRetry={() => {
                void subjectsQuery.refetch();
              }}
            />
          ) : (
            <SubjectBreakdown data={subjectsQuery.data ?? []} />
          )}
        </ErrorBoundary>
      </div>
      <div className="grid items-start gap-6 xl:grid-cols-2">
        <ErrorBoundary fallbackTitle="Could not load recent tasks">
          {tasksQuery.isPending ? (
            <LoadingState variant="tasks" />
          ) : tasksQuery.isError ? (
            <QueryError
              onRetry={() => {
                void tasksQuery.refetch();
              }}
            />
          ) : (
            <RecentTasks tasks={tasksQuery.data ?? []} />
          )}
        </ErrorBoundary>
        <ErrorBoundary fallbackTitle="Could not load Pomodoro widget">
          <PomodoroWidget />
        </ErrorBoundary>
      </div>
    </div>
  );
}
