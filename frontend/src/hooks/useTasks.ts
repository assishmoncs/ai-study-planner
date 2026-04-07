import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import type { Task } from '@/types';

export const useTasks = (filters?: { status?: string; priority?: string; studyPlan?: string }) => {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.priority) params.append('priority', filters.priority);
  if (filters?.studyPlan) params.append('studyPlan', filters.studyPlan);
  const query = params.toString();

  return useQuery<Task[]>({
    queryKey: ['tasks', filters],
    queryFn: () =>
      apiClient
        .get(`/tasks${query ? `?${query}` : ''}`)
        .then((r) => r.data.data.tasks),
  });
};
