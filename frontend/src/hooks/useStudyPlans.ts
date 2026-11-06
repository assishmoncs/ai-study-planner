import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import type { AIGeneratePayload, AIStudyPlanResponse, StudyPlan } from '@/types';

export interface StudyPlanQueryFilters {
  status?: string;
  subject?: string;
  priority?: string;
  search?: string;
}

/**
 * Fetches study plans for the authenticated user with optional filtering.
 */
export const useStudyPlans = (filters?: StudyPlanQueryFilters) => {
  const params = new URLSearchParams();
  if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
  if (filters?.subject) params.append('subject', filters.subject);
  if (filters?.priority && filters.priority !== 'all') params.append('priority', filters.priority);
  if (filters?.search?.trim()) params.append('search', filters.search.trim());
  const query = params.toString();

  return useQuery<StudyPlan[]>({
    queryKey: ['study-plans', filters ?? {}],
    queryFn: () =>
      apiClient.get(`/study-plans${query ? `?${query}` : ''}`).then((r) => r.data.data.plans),
  });
};

/**
 * Mutation hook to generate an AI-powered study plan roadmap.
 */
export const useGenerateAIPlan = () => {
  return useMutation<AIStudyPlanResponse, Error, AIGeneratePayload>({
    mutationFn: (payload) =>
      apiClient
        .post('/study-plans/ai/suggest', payload)
        .then((r) => r.data.data.suggestions as AIStudyPlanResponse),
  });
};

/**
 * Mutation hook to log hours against an existing study plan.
 */
export const useLogStudyHours = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, hours }: { id: string; hours: number }) =>
      apiClient.post(`/study-plans/${id}/log-hours`, { hours }).then((r) => r.data.data.plan),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-plans'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
};
