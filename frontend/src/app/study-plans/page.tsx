'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Study Plans</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Organize your learning goals</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + New Plan
        </button>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card h-40 animate-pulse bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
      )}

      {!isLoading && (!data || data.length === 0) && (
        <div className="card text-center py-16">
          <p className="text-4xl mb-4">📚</p>
          <p className="text-slate-600 dark:text-slate-300 font-medium">No study plans yet</p>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Create your first plan to get started</p>
        </div>
      )}

      {!isLoading && data && data.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
