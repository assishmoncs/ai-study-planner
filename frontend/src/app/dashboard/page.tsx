'use client';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import StatCard from '@/components/dashboard/StatCard';
import ActivityChart from '@/components/dashboard/ActivityChart';
import SubjectBreakdown from '@/components/dashboard/SubjectBreakdown';
import RecentTasks from '@/components/dashboard/RecentTasks';

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
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Your study overview at a glance</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tasks Pending"
          value={summaryLoading ? '…' : String(
            summary?.taskStats?.find((s: { _id: string }) => s._id === 'todo')?.count ?? 0
          )}
          icon="📋"
          color="blue"
        />
        <StatCard
          title="Tasks Completed"
          value={summaryLoading ? '…' : String(
            summary?.taskStats?.find((s: { _id: string }) => s._id === 'completed')?.count ?? 0
          )}
          icon="✅"
          color="green"
        />
        <StatCard
          title="Active Plans"
          value={summaryLoading ? '…' : String(
            summary?.planStats?.find((s: { _id: string }) => s._id === 'active')?.count ?? 0
          )}
          icon="📚"
          color="purple"
        />
        <StatCard
          title="Hours Studied"
          value={summaryLoading ? '…' : String(
            Math.round(
              summary?.planStats?.reduce(
                (acc: number, s: { totalCompletedHours: number }) => acc + s.totalCompletedHours,
                0
              ) ?? 0
            )
          )}
          icon="⏰"
          color="orange"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActivityChart data={activityData ?? []} />
        </div>
        <div>
          <SubjectBreakdown data={subjectsData ?? []} />
        </div>
      </div>

      {/* Recent tasks */}
      <RecentTasks tasks={tasksData ?? []} />
    </div>
  );
}
