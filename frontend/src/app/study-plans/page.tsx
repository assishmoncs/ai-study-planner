'use client';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search } from 'lucide-react';
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

  const { data, isLoading } = useStudyPlans({
    status: statusFilter,
    search: searchQuery,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/study-plans/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-plans'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      toast({ title: 'Plan deleted', variant: 'success' });
    },
  });

  const logHoursMutation = useMutation({
    mutationFn: ({ id, hours }: { id: string; hours: number }) =>
      apiClient.post(`/study-plans/${id}/log-hours`, { hours }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-plans'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      toast({ title: 'Study time logged', description: '+0.5h added to plan.', variant: 'success' });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: StudyPlan['status'] }) =>
      apiClient.patch(`/study-plans/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-plans'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-100 sm:text-3xl">
            Study Plans
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Organize your learning goals and AI study roadmaps
          </p>
        </div>
        <button className="btn-primary w-full sm:w-auto" onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          New Plan
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex overflow-x-auto rounded-lg border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`min-w-fit rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors duration-200 ${
                statusFilter === s
                  ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900'
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search plans or subjects..."
            className="input !pl-9"
          />
        </div>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card h-44 animate-pulse bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
      )}

      {!isLoading && (!data || data.length === 0) && (
        <div className="card py-16 text-center">
          <p className="font-medium text-slate-700 dark:text-slate-200">No study plans found</p>
          <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
            Create a new plan or generate one with AI to get started
          </p>
        </div>
      )}

      {!isLoading && data && data.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.map((plan) => (
            <StudyPlanCard
              key={plan._id}
              plan={plan}
              onDelete={() => deleteMutation.mutate(plan._id)}
              onLogHours={(hours) => logHoursMutation.mutate({ id: plan._id, hours })}
              onStatusChange={(status) => updateStatusMutation.mutate({ id: plan._id, status })}
            />
          ))}
        </div>
      )}

      {showModal && <CreatePlanModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
