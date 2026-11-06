'use client';
import { useState } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';
import ActivityChart from '@/components/dashboard/ActivityChart';
import SubjectBreakdown from '@/components/dashboard/SubjectBreakdown';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

const RANGE_OPTIONS = [7, 30, 90] as const;

export default function AnalyticsPage() {
  const [days, setDays] = useState<number>(90);
  const { daily, subjects } = useAnalytics(days);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-100 sm:text-3xl">
            Analytics
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Insights into your study velocity and subject distribution
          </p>
        </div>

        <div className="flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          {RANGE_OPTIONS.map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => setDays(range)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                days === range
                  ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900'
              }`}
            >
              Last {range}d
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ErrorBoundary fallbackTitle="Could not load activity chart">
            <ActivityChart data={daily.data ?? []} title={`Last ${days} Days Activity`} />
          </ErrorBoundary>
        </div>
        <ErrorBoundary fallbackTitle="Could not load subject breakdown">
          <SubjectBreakdown data={subjects.data ?? []} />
        </ErrorBoundary>
      </div>
    </div>
  );
}
