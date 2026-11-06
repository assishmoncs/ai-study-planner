'use client';
import { useState } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';
import ActivityChart from '@/components/dashboard/ActivityChart';
import SubjectBreakdown from '@/components/dashboard/SubjectBreakdown';
import LoadingState from '@/components/ui/LoadingState';
import QueryError from '@/components/ui/QueryError';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

const RANGE_OPTIONS = [7, 30, 90] as const;

export default function AnalyticsPage() {
  const [days, setDays] = useState<number>(90);
  const { daily, subjects } = useAnalytics(days);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Insights into your study velocity and subject distribution
          </p>
        </div>

        <div className="filter-group">
          {RANGE_OPTIONS.map((range) => (
            <button
              key={range}
              aria-pressed={days === range}
              type="button"
              onClick={() => setDays(range)}
              className={`filter-button ${days === range ? 'filter-active' : 'filter-inactive'}`}
            >
              Last {range}d
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="min-w-0 xl:col-span-2">
          <ErrorBoundary fallbackTitle="Could not load activity chart">
            {daily.isPending ? (
              <LoadingState />
            ) : daily.isError ? (
              <QueryError
                onRetry={() => {
                  void daily.refetch();
                }}
              />
            ) : (
              <ActivityChart data={daily.data ?? []} title={`Last ${days} days activity`} />
            )}
          </ErrorBoundary>
        </div>
        <ErrorBoundary fallbackTitle="Could not load subject breakdown">
          {subjects.isPending ? (
            <LoadingState />
          ) : subjects.isError ? (
            <QueryError
              onRetry={() => {
                void subjects.refetch();
              }}
            />
          ) : (
            <SubjectBreakdown data={subjects.data ?? []} />
          )}
        </ErrorBoundary>
      </div>
    </div>
  );
}
