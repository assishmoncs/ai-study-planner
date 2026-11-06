import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import type { ApiResponse, Task } from '@/types';
import { responseData } from '@/lib/response';

export interface TaskQueryFilters {
  status?: string;
  priority?: string;
  studyPlan?: string;
  search?: string;
}

/**
 * Fetches tasks for the authenticated user with optional status, priority, plan, and search filters.
 */
export const useTasks = (filters?: TaskQueryFilters) => {
  const params = new URLSearchParams();
  if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
  if (filters?.priority && filters.priority !== 'all') params.append('priority', filters.priority);
  if (filters?.studyPlan) params.append('studyPlan', filters.studyPlan);
  if (filters?.search?.trim()) params.append('search', filters.search.trim());
  const query = params.toString();

  return useQuery<Task[]>({
    queryKey: ['tasks', filters ?? {}],
    queryFn: () =>
      apiClient
        .get<ApiResponse<{ tasks: Task[] }>>(`/tasks${query ? `?${query}` : ''}`)
        .then((r) => responseData(r.data).tasks),
  });
};

/**
 * Mutation hook to generate AI-suggested tasks for a subject.
 */
export const useSuggestAITasks = () => {
  const queryClient = useQueryClient();
  return useMutation<string[], Error, { subject: string; description?: string }>({
    mutationFn: (payload) =>
      apiClient
        .post<ApiResponse<{ tasks: string[] }>>('/tasks/ai/suggest', payload)
        .then((r) => responseData(r.data).tasks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};
