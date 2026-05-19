'use client';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import StatCard from '@/components/dashboard/StatCard';
import ActivityChart from '@/components/dashboard/ActivityChart';
import SubjectBreakdown from '@/components/dashboard/SubjectBreakdown';
import RecentTasks from '@/components/dashboard/RecentTasks';
import { BookOpen, CheckCircle2, Clock3, ClipboardList } from 'lucide-react';

export default function DashboardPage() {
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['analytics', 'summary'],
    queryFn: () => apiClient.get('/analytics/summary').then((r) => r.data.data),
  });

  const { data: activityData } = useQuery({
    queryKey: ['analytics', 'daily'],
    queryFn: () => apiClient.get('/analytics/daily?days=30').then((r) => r.data.data.activity),
  });

  const { data: subjectsData } = useQuery({
    queryKey: ['analytics', 'subjects'],
    queryFn: () => apiClient.get('/analytics/subjects').then((r) => r.data.data.subjects),
  });

  const { data: tasksData } = useQuery({
    queryKey: ['tasks', 'recent'],
    queryFn: () => apiClient.get('/tasks?status=todo').then((r) => r.data.data.tasks),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-100 sm:text-3xl">
          Dashboard
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Your study overview at a glance</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Tasks Pending"
          value={summaryLoading ? '...' : String(
            summary?.taskStats?.find((s: { _id: string }) => s._id === 'todo')?.count ?? 0
          )}
          icon={ClipboardList}
          color="blue"
        />
        <StatCard
          title="Tasks Completed"
          value={summaryLoading ? '...' : String(
            summary?.taskStats?.find((s: { _id: string }) => s._id === 'completed')?.count ?? 0
          )}
          icon={CheckCircle2}
          color="green"
        />
        <StatCard
          title="Active Plans"
          value={summaryLoading ? '...' : String(
            summary?.planStats?.find((s: { _id: string }) => s._id === 'active')?.count ?? 0
          )}
          icon={BookOpen}
          color="violet"
        />
        <StatCard
          title="Hours Studied"
          value={summaryLoading ? '...' : String(
            Math.round(
              summary?.planStats?.reduce(
                (acc: number, s: { totalCompletedHours: number }) => acc + s.totalCompletedHours,
                0
              ) ?? 0
            )
          )}
          icon={Clock3}
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ActivityChart data={activityData ?? []} />
        </div>
        <SubjectBreakdown data={subjectsData ?? []} />
      </div>

      <RecentTasks tasks={tasksData ?? []} />
    </div>
  );
}
