'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    defaultValues: { priority: 'medium' },
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => apiClient.post('/study-plans', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-plans'] });
      onClose();
    },
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">New Study Plan</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors duration-200">✕</button>
        </div>

        {mutation.error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-300 rounded-xl text-sm">
            Failed to create plan. Please try again.
          </div>
        )}

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Title *</label>
            <input className="input" {...register('title', { required: true })} placeholder="e.g. Linear Algebra Exam Prep" />
            {errors.title && <p className="text-red-500 text-xs mt-1">Required</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Subject *</label>
            <input className="input" {...register('subject', { required: true })} placeholder="e.g. Mathematics" />
            {errors.subject && <p className="text-red-500 text-xs mt-1">Required</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <textarea className="input resize-none" rows={2} {...register('description')} placeholder="Optional notes…" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Start Date *</label>
              <input type="date" className="input" {...register('startDate', { required: true })} />
              {errors.startDate && <p className="text-red-500 text-xs mt-1">Required</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">End Date *</label>
              <input type="date" className="input" {...register('endDate', { required: true })} />
              {errors.endDate && <p className="text-red-500 text-xs mt-1">Required</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Target Hours *</label>
              <input type="number" step="0.5" min="0.5" className="input" {...register('targetHours', { required: true, min: 0.5, valueAsNumber: true })} />
              {errors.targetHours && <p className="text-red-500 text-xs mt-1">Min 0.5</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Priority</label>
              <select className="input" {...register('priority')}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" className="btn-secondary flex-1" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={isSubmitting}>
              {isSubmitting ? 'Creating…' : 'Create Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
