import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export const useAnalytics = (days = 30) => {
  const summary = useQuery({
    queryKey: ['analytics', 'summary'],
    queryFn: () => apiClient.get('/analytics/summary').then((r) => r.data.data),
  });

  const daily = useQuery({
    queryKey: ['analytics', 'daily', days],
    queryFn: () =>
      apiClient.get(`/analytics/daily?days=${days}`).then((r) => r.data.data.activity),
  });

  const subjects = useQuery({
    queryKey: ['analytics', 'subjects'],
    queryFn: () => apiClient.get('/analytics/subjects').then((r) => r.data.data.subjects),
  });

  return { summary, daily, subjects };
};
