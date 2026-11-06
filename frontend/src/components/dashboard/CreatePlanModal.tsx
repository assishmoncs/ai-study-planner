'use client';
import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Sparkles, X, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { apiClient } from '@/lib/api';
import { useToast } from '@/components/ui/Toaster';
import type { AIStudyPlanResponse, SkillLevel } from '@/types';

interface FormData {
  title: string;
  subject: string;
  description: string;
  startDate: string;
  endDate: string;
  targetHours: number;
  priority: string;
  color: string;
}

const PLAN_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#0ea5e9', '#8b5cf6'];

/**
 * Modal dialog for creating a new Study Plan, featuring an integrated
 * AI Study Plan Generator that pre-populates the title, description,
 * target hours, and structured daily curriculum.
 */
export default function CreatePlanModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const todayStr = new Date().toISOString().slice(0, 10);
  const nextWeekStr = new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 10);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      priority: 'medium',
      color: '#6366f1',
      startDate: todayStr,
      endDate: nextWeekStr,
      targetHours: 14,
    },
  });

  const startDate = watch('startDate');
  const subjectValue = watch('subject');
  const selectedColor = watch('color');

  const [aiLevel, setAiLevel] = useState<SkillLevel>('beginner');
  const [aiDays, setAiDays] = useState<number>(7);
  const [aiHoursPerDay, setAiHoursPerDay] = useState<number>(2);
  const [aiPreview, setAiPreview] = useState<AIStudyPlanResponse | null>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const aiMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post('/study-plans/ai/suggest', {
        subject: subjectValue || 'General Study',
        daysAvailable: aiDays,
        hoursPerDay: aiHoursPerDay,
        currentLevel: aiLevel,
      });
      return res.data.data.suggestions as AIStudyPlanResponse;
    },
    onSuccess: (suggestions) => {
      setAiPreview(suggestions);
      setValue('title', suggestions.title, { shouldValidate: true });
      setValue('description', suggestions.summary, { shouldValidate: true });
      setValue('targetHours', Math.max(0.5, Number((aiDays * aiHoursPerDay).toFixed(1))), {
        shouldValidate: true,
      });
      const end = new Date();
      end.setDate(end.getDate() + Math.max(1, aiDays));
      setValue('endDate', end.toISOString().slice(0, 10), { shouldValidate: true });
      toast({
        title: 'AI roadmap generated',
        description: 'Form fields have been populated from your AI study plan.',
        variant: 'success',
      });
    },
    onError: () => {
      toast({
        title: 'AI suggestion failed',
        description: 'Could not generate AI suggestions right now.',
        variant: 'error',
      });
    },
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      apiClient.post('/study-plans', {
        ...data,
        aiGenerated: Boolean(aiPreview),
        aiSuggestions: aiPreview ? JSON.stringify(aiPreview) : '',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-plans'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      toast({ title: 'Plan created', description: 'Your study plan is ready.', variant: 'success' });
      onClose();
    },
    onError: () => {
      toast({
        title: 'Could not create plan',
        description: 'Please check the fields and try again.',
        variant: 'error',
      });
    },
  });

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal-panel max-w-lg max-h-[calc(100dvh-2rem)] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              New Study Plan
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configure manually or generate a structured curriculum with AI
            </p>
          </div>
          <button
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Close"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* AI Assistant Box */}
        <div className="mb-5 rounded-xl border border-indigo-200/80 bg-indigo-50/60 p-3.5 dark:border-indigo-900/50 dark:bg-indigo-950/30">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              AI Study Roadmap Assistant
            </span>
            <button
              type="button"
              disabled={!subjectValue?.trim() || aiMutation.isPending}
              onClick={() => aiMutation.mutate()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
            >
              {aiMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              {aiMutation.isPending ? 'Generating...' : 'Generate with AI'}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="mb-1 block text-[11px] font-medium text-slate-600 dark:text-slate-400">
                Days
              </label>
              <input
                type="number"
                min={1}
                max={60}
                value={aiDays}
                onChange={(e) => setAiDays(Math.min(60, Math.max(1, Number(e.target.value) || 7)))}
                className="input !py-1 !text-xs"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-medium text-slate-600 dark:text-slate-400">
                Hours / Day
              </label>
              <input
                type="number"
                min={0.5}
                max={16}
                step={0.5}
                value={aiHoursPerDay}
                onChange={(e) =>
                  setAiHoursPerDay(Math.min(16, Math.max(0.5, Number(e.target.value) || 2)))
                }
                className="input !py-1 !text-xs"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-medium text-slate-600 dark:text-slate-400">
                Skill Level
              </label>
              <select
                value={aiLevel}
                onChange={(e) => setAiLevel(e.target.value as SkillLevel)}
                className="input !py-1 !text-xs"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>
          {!subjectValue?.trim() && (
            <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
              Enter a Subject below first, then click &ldquo;Generate with AI&rdquo;.
            </p>
          )}
        </div>

        {mutation.error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-300">
            Failed to create plan. Please try again.
          </div>
        )}

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
              Subject *
            </label>
            <input
              className="input"
              {...register('subject', { required: true })}
              placeholder="e.g. Mathematics, Distributed Systems, Organic Chemistry"
            />
            {errors.subject && <p className="mt-1 text-xs text-red-500">Required</p>}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
              Title *
            </label>
            <input
              className="input"
              {...register('title', { required: true })}
              placeholder="e.g. Linear Algebra Exam Prep"
            />
            {errors.title && <p className="mt-1 text-xs text-red-500">Required</p>}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
              Description
            </label>
            <textarea
              className="input resize-none"
              rows={2}
              {...register('description')}
              placeholder="Optional notes or AI summary..."
            />
          </div>

          {aiPreview && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-900/50">
              <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
                AI Daily Roadmap ({aiPreview.dailyPlan.length} days)
              </p>
              <ul className="max-h-28 space-y-1 overflow-y-auto text-slate-600 dark:text-slate-400">
                {aiPreview.dailyPlan.slice(0, 5).map((d) => (
                  <li key={d.day}>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      Day {d.day}:
                    </span>{' '}
                    {d.focus}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                Start Date *
              </label>
              <input
                type="date"
                className="input"
                {...register('startDate', { required: true })}
              />
              {errors.startDate && <p className="mt-1 text-xs text-red-500">Required</p>}
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                End Date *
              </label>
              <input
                type="date"
                className="input"
                {...register('endDate', {
                  required: true,
                  validate: (value) =>
                    !startDate || value >= startDate || 'End date must be after start date',
                })}
              />
              {errors.endDate && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.endDate.message || 'Required'}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                Target Hours *
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                className="input"
                {...register('targetHours', {
                  required: true,
                  min: 0.5,
                  valueAsNumber: true,
                })}
              />
              {errors.targetHours && <p className="mt-1 text-xs text-red-500">Min 0.5</p>}
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                Priority
              </label>
              <select className="input" {...register('priority')}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
              Accent Color
            </label>
            <div className="flex items-center gap-2">
              {PLAN_COLORS.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  onClick={() => setValue('color', hex)}
                  className={`h-6 w-6 rounded-full transition-transform ${
                    selectedColor === hex ? 'scale-110 ring-2 ring-offset-2 ring-slate-400' : ''
                  }`}
                  style={{ backgroundColor: hex }}
                  aria-label={`Select color ${hex}`}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <button type="button" className="btn-secondary flex-1" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1" disabled={mutation.isPending}>
              {mutation.isPending ? 'Creating...' : 'Create Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
