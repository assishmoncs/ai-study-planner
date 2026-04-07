import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import type { StudyPlan } from '@/types';

export const useStudyPlans = (filters?: { status?: string; subject?: string }) => {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.subject) params.append('subject', filters.subject);
  const query = params.toString();

  return useQuery<StudyPlan[]>({
    queryKey: ['study-plans', filters],
    queryFn: () =>
      apiClient
        .get(`/study-plans${query ? `?${query}` : ''}`)
        .then((r) => r.data.data.plans),
  });
};
