'use client';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Sparkles } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { apiClient } from '@/lib/api';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toaster';
import type { StudyPlan } from '@/types';

interface FormData {
  title: string;
  description: string;
  dueDate: string;
  estimatedMinutes: number;
  priority: string;
  studyPlan: string;
}

/**
 * Modal dialog for creating a new study task, supporting StudyPlan linking
 * and one-click AI Task Breakdown suggestions.
 */
export default function CreateTaskModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [aiTasks, setAiTasks] = useState<string[]>([]);
  const [aiTopic, setAiTopic] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: { priority: 'medium', estimatedMinutes: 30, studyPlan: '' },
  });

  const selectedPlanId = watch('studyPlan');

  const { data: plans = [] } = useQuery<StudyPlan[]>({
    queryKey: ['study-plans'],
    queryFn: () => apiClient.get('/study-plans').then((r) => r.data.data.plans),
  });

  const aiSuggestMutation = useMutation({
    mutationFn: async () => {
      const linkedPlan = plans.find((p) => p._id === selectedPlanId);
      const subject = aiTopic.trim() || linkedPlan?.subject || linkedPlan?.title || 'General Study';
      const res = await apiClient.post('/tasks/ai/suggest', {
        subject,
        description: linkedPlan?.description || '',
      });
      return res.data.data.tasks as string[];
    },
    onSuccess: (suggestions) => {
      setAiTasks(suggestions);
      if (suggestions.length > 0 && !watch('title')) {
        setValue('title', suggestions[0], { shouldValidate: true });
      }
    },
    onError: () => {
      toast({
        title: 'AI suggestion failed',
        description: 'Could not generate task suggestions right now.',
        variant: 'error',
      });
    },
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      apiClient.post('/tasks', {
        ...data,
        studyPlan: data.studyPlan || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      toast({
        title: 'Task created',
        description: 'Your task has been added.',
        variant: 'success',
      });
      onClose();
    },
    onError: () => {
      toast({
        title: 'Could not create task',
        description: 'Please check the fields and try again.',
        variant: 'error',
      });
    },
  });

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="New Task"
      description="Turn your next step into a clear, achievable task."
      maxWidth="lg"
    >
      {/* AI Task Suggestion Assistant */}
      <div className="mb-4 rounded-xl border border-indigo-200/80 bg-indigo-50/60 p-3 dark:border-indigo-900/50 dark:bg-indigo-950/30">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={aiTopic}
            onChange={(e) => setAiTopic(e.target.value)}
            aria-label="Topic for AI task ideas"
            placeholder="Topic for AI task ideas (e.g. Calculus Derivatives)..."
            className="input !py-1.5 !text-xs flex-1"
          />
          <button
            type="button"
            onClick={() => aiSuggestMutation.mutate()}
            disabled={aiSuggestMutation.isPending}
            className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {aiSuggestMutation.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            AI Ideas
          </button>
        </div>
        {aiTasks.length > 0 && (
          <div className="mt-2.5 space-y-1">
            <p className="text-[11px] font-medium text-indigo-800 dark:text-indigo-300">
              Click an AI suggestion to use it:
            </p>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {aiTasks.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setValue('title', suggestion, { shouldValidate: true })}
                  className="rounded-md border border-indigo-200 bg-white px-2 py-1 text-left text-[11px] text-slate-700 transition hover:bg-indigo-100 dark:border-indigo-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-indigo-950"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {mutation.error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-300">
          Failed to create task. Please try again.
        </div>
      )}

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
        <div>
          <label
            htmlFor="createtaskmodal-field-1"
            className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300"
          >
            Title *
          </label>
          <input
            id="createtaskmodal-field-1"
            className="input"
            {...register('title', { required: true })}
            placeholder="e.g. Read chapter 4 and solve practice set"
          />
          {errors.title && <p className="mt-1 text-xs text-red-500">Required</p>}
        </div>

        <div>
          <label
            htmlFor="createtaskmodal-field-2"
            className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300"
          >
            Description
          </label>
          <textarea
            id="createtaskmodal-field-2"
            className="input resize-none"
            rows={2}
            {...register('description')}
            placeholder="Optional notes..."
          />
        </div>

        {plans.length > 0 && (
          <div>
            <label
              htmlFor="createtaskmodal-field-3"
              className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300"
            >
              Study Plan (Optional)
            </label>
            <select id="createtaskmodal-field-3" className="input" {...register('studyPlan')}>
              <option value="">No linked study plan</option>
              {plans.map((plan) => (
                <option key={plan._id} value={plan._id}>
                  {plan.title} ({plan.subject})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor="createtaskmodal-field-4"
              className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300"
            >
              Due Date
            </label>
            <input
              id="createtaskmodal-field-4"
              type="date"
              className="input"
              {...register('dueDate')}
            />
          </div>
          <div>
            <label
              htmlFor="createtaskmodal-field-5"
              className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300"
            >
              Est. Minutes
            </label>
            <input
              id="createtaskmodal-field-5"
              type="number"
              min="1"
              max="1440"
              className="input"
              {...register('estimatedMinutes', { min: 1, max: 1440, valueAsNumber: true })}
            />
            {errors.estimatedMinutes && <p className="mt-1 text-xs text-red-500">1–1440 min</p>}
          </div>
        </div>

        <div>
          <label
            htmlFor="createtaskmodal-field-6"
            className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300"
          >
            Priority
          </label>
          <select id="createtaskmodal-field-6" className="input" {...register('priority')}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <button type="button" className="btn-secondary flex-1" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary flex-1" disabled={mutation.isPending}>
            {mutation.isPending ? 'Creating...' : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
