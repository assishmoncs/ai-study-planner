'use client';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import ActivityChart from '@/components/dashboard/ActivityChart';
import SubjectBreakdown from '@/components/dashboard/SubjectBreakdown';

export default function AnalyticsPage() {
  const { data: activity } = useQuery({
    queryKey: ['analytics', 'daily', 90],
    queryFn: () => apiClient.get('/analytics/daily?days=90').then((r) => r.data.data.activity),
  });

  const { data: subjects } = useQuery({
    queryKey: ['analytics', 'subjects'],
    queryFn: () => apiClient.get('/analytics/subjects').then((r) => r.data.data.subjects),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Analytics</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Insights into your productivity</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActivityChart data={activity ?? []} title="Last 90 Days Activity" />
        </div>
        <SubjectBreakdown data={subjects ?? []} />
      </div>
    </div>
  );
}
