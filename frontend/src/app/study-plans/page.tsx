'use client';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, BookOpen } from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';
import LoadingState from '@/components/ui/LoadingState';
import QueryError from '@/components/ui/QueryError';
import { apiClient } from '@/lib/api';
import { useStudyPlans } from '@/hooks/useStudyPlans';
import StudyPlanCard from '@/components/dashboard/StudyPlanCard';
import CreatePlanModal from '@/components/dashboard/CreatePlanModal';
import { useToast } from '@/components/ui/Toaster';
import type { StudyPlan } from '@/types';

const STATUS_FILTERS = ['all', 'active', 'paused', 'completed', 'archived'] as const;

export default function StudyPlansPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { data, isLoading, isError, refetch } = useStudyPlans({
    status: statusFilter,
    search: searchQuery,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/study-plans/${id}`),
    onError: () => {
      toast({
        title: 'Could not save your changes',
        description: 'Please try again.',
        variant: 'error',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-plans'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      toast({ title: 'Plan deleted', variant: 'success' });
    },
  });

  const logHoursMutation = useMutation({
    mutationFn: ({ id, hours }: { id: string; hours: number }) =>
      apiClient.post(`/study-plans/${id}/log-hours`, { hours }),
    onError: () => {
      toast({
        title: 'Could not save your changes',
        description: 'Please try again.',
        variant: 'error',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-plans'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      toast({
        title: 'Study time logged',
        description: '+0.5h added to plan.',
        variant: 'success',
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: StudyPlan['status'] }) =>
      apiClient.patch(`/study-plans/${id}`, { status }),
    onError: () => {
      toast({
        title: 'Could not save your changes',
        description: 'Please try again.',
        variant: 'error',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-plans'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="page-title">Study Plans</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Organize your learning goals and AI study roadmaps
          </p>
        </div>
        <button className="btn-primary w-full sm:w-auto" onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          New Plan
        </button>
      </div>

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="filter-group">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              aria-pressed={statusFilter === s}
              onClick={() => setStatusFilter(s)}
              className={`filter-button ${
                statusFilter === s ? 'filter-active' : 'filter-inactive'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="search"
            aria-label="Search plans"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search plans or subjects..."
            className="input !pl-9"
          />
        </div>
      </div>

      {isLoading && <LoadingState variant="plans" count={3} />}
      {isError && (
        <QueryError
          title="Could not load your study plans"
          onRetry={() => {
            void refetch();
          }}
        />
      )}
      {!isLoading && !isError && (!data || data.length === 0) && (
        <div className="card">
          <EmptyState
            icon={BookOpen}
            title={
              statusFilter !== 'all' || Boolean(searchQuery)
                ? 'No matches just yet'
                : 'Your next chapter starts here'
            }
            description={
              statusFilter !== 'all' || Boolean(searchQuery)
                ? 'Try another search or clear your filters to see everything.'
                : 'Create a study plan with a clear goal, or get a little help from AI.'
            }
          >
            {statusFilter !== 'all' || Boolean(searchQuery) ? (
              <button
                className="btn-secondary"
                onClick={() => {
                  setStatusFilter('all');
                  setSearchQuery('');
                }}
              >
                Clear filters
              </button>
            ) : (
              <button className="btn-primary" onClick={() => setShowModal(true)}>
                <Plus className="h-4 w-4" />
                Create your first plan
              </button>
            )}
          </EmptyState>
        </div>
      )}

      {!isLoading && data && data.length > 0 && (
        <fieldset
          disabled={
            deleteMutation.isPending || logHoursMutation.isPending || updateStatusMutation.isPending
          }
          aria-busy={
            deleteMutation.isPending || logHoursMutation.isPending || updateStatusMutation.isPending
          }
          className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 min-w-0 border-0 p-0 disabled:opacity-70"
        >
          <legend className="sr-only">Study plans</legend>
          {data.map((plan) => (
            <StudyPlanCard
              key={plan._id}
              plan={plan}
              onDelete={() => deleteMutation.mutate(plan._id)}
              onLogHours={(hours) => logHoursMutation.mutate({ id: plan._id, hours })}
              onStatusChange={(status) => updateStatusMutation.mutate({ id: plan._id, status })}
            />
          ))}
        </fieldset>
      )}

      {showModal && <CreatePlanModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
