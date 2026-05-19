'use client';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { apiClient } from '@/lib/api';
import StudyPlanCard from '@/components/dashboard/StudyPlanCard';
import CreatePlanModal from '@/components/dashboard/CreatePlanModal';
import type { StudyPlan } from '@/types';

export default function StudyPlansPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['study-plans'],
    queryFn: () => apiClient.get('/study-plans').then((r) => r.data.data.plans as StudyPlan[]),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/study-plans/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['study-plans'] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-100 sm:text-3xl">
            Study Plan
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Organize your learning goals</p>
        </div>
        <button className="btn-primary w-full sm:w-auto" onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          New Plan
        </button>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card h-40 animate-pulse bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
      )}

      {!isLoading && (!data || data.length === 0) && (
        <div className="card py-16 text-center">
          <p className="font-medium text-slate-700 dark:text-slate-200">No study plans yet</p>
          <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">Create your first plan to get started</p>
        </div>
      )}

      {!isLoading && data && data.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.map((plan) => (
            <StudyPlanCard
              key={plan._id}
              plan={plan}
              onDelete={() => deleteMutation.mutate(plan._id)}
            />
          ))}
        </div>
      )}

      {showModal && <CreatePlanModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
