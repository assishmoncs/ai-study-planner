import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { responseData } from '@/lib/response';
import type { ApiResponse } from '@/types';
import type { AnalyticsSummary, DailyActivity, SubjectActivity } from '@/types/analytics';

/**
 * Custom hook providing TanStack Query streams for summary stats,
 * daily study activity, and per-subject breakdowns.
 *
 * @param days - Lookback window in days for the daily activity chart (default: 30)
 */
export const useAnalytics = (days = 30) => {
  const summary = useQuery({
    queryKey: ['analytics', 'summary'],
    queryFn: () =>
      apiClient
        .get<ApiResponse<AnalyticsSummary>>('/analytics/summary')
        .then((r) => responseData(r.data)),
  });

  const daily = useQuery({
    queryKey: ['analytics', 'daily', days],
    queryFn: () =>
      apiClient
        .get<ApiResponse<{ activity: DailyActivity[] }>>(`/analytics/daily?days=${days}`)
        .then((r) => responseData(r.data).activity),
  });

  const subjects = useQuery({
    queryKey: ['analytics', 'subjects'],
    queryFn: () =>
      apiClient
        .get<ApiResponse<{ subjects: SubjectActivity[] }>>('/analytics/subjects')
        .then((r) => responseData(r.data).subjects),
  });

  return { summary, daily, subjects };
};
