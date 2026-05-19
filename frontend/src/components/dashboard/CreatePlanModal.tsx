'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { apiClient } from '@/lib/api';

interface FormData {
  title: string;
  subject: string;
  description: string;
  startDate: string;
  endDate: string;
  targetHours: number;
  priority: string;
}

export default function CreatePlanModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: { priority: 'medium' },
  });
  const startDate = watch('startDate');

  const mutation = useMutation({
    mutationFn: (data: FormData) => apiClient.post('/study-plans', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-plans'] });
      onClose();
    },
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel max-h-[calc(100dvh-2rem)] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">New Study Plan</h2>
          <button
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Close"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {mutation.error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-300">
            Failed to create plan. Please try again.
          </div>
        )}

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">Title *</label>
            <input className="input" {...register('title', { required: true })} placeholder="e.g. Linear Algebra Exam Prep" />
            {errors.title && <p className="mt-1 text-xs text-red-500">Required</p>}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">Subject *</label>
            <input className="input" {...register('subject', { required: true })} placeholder="e.g. Mathematics" />
            {errors.subject && <p className="mt-1 text-xs text-red-500">Required</p>}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">Description</label>
            <textarea className="input resize-none" rows={2} {...register('description')} placeholder="Optional notes..." />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">Start Date *</label>
              <input type="date" className="input" {...register('startDate', { required: true })} />
              {errors.startDate && <p className="mt-1 text-xs text-red-500">Required</p>}
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">End Date *</label>
              <input
                type="date"
                className="input"
                {...register('endDate', {
                  required: true,
                  validate: (value) => !startDate || value >= startDate || 'End date must be after start date',
                })}
              />
              {errors.endDate && <p className="mt-1 text-xs text-red-500">{errors.endDate.message || 'Required'}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">Target Hours *</label>
              <input type="number" step="0.5" min="0.5" className="input" {...register('targetHours', { required: true, min: 0.5, valueAsNumber: true })} />
              {errors.targetHours && <p className="mt-1 text-xs text-red-500">Min 0.5</p>}
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">Priority</label>
              <select className="input" {...register('priority')}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <button type="button" className="btn-secondary flex-1" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={mutation.isPending}>
              {mutation.isPending ? 'Creating...' : 'Create Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
