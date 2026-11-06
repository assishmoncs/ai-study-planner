'use client';
import { useState } from 'react';
import { ChevronDown, ChevronUp, Clock, Sparkles, Trash2 } from 'lucide-react';
import type { AIStudyPlanResponse, StudyPlan } from '@/types';

interface StudyPlanCardProps {
  plan: StudyPlan;
  onDelete: () => void;
  onLogHours?: (hours: number) => void;
  onStatusChange?: (status: StudyPlan['status']) => void;
}

const STATUS_COLORS: Record<string, string> = {
  active:
    'bg-emerald-50 text-emerald-700 ring-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900/60',
  paused:
    'bg-amber-50 text-amber-700 ring-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900/60',
  completed:
    'bg-blue-50 text-blue-700 ring-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-900/60',
  archived:
    'bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700',
};

/**
 * Displays a StudyPlan card with progress visualization, quick study-hour logging,
 * status transitions, and an expandable AI-generated curriculum roadmap.
 */
export default function StudyPlanCard({
  plan,
  onDelete,
  onLogHours,
  onStatusChange,
}: StudyPlanCardProps) {
  const [showRoadmap, setShowRoadmap] = useState(false);

  const progress =
    plan.targetHours > 0
      ? Math.min(Math.round((plan.completedHours / plan.targetHours) * 100), 100)
      : 0;

  let parsedRoadmap: AIStudyPlanResponse | null = null;
  if (plan.aiSuggestions) {
    try {
      const candidate = JSON.parse(plan.aiSuggestions);
      if (candidate && Array.isArray(candidate.dailyPlan)) {
        parsedRoadmap = candidate as AIStudyPlanResponse;
      }
    } catch {
      parsedRoadmap = null;
    }
  }

  return (
    <div className="card flex flex-col justify-between transition duration-200 hover:border-indigo-200 hover:shadow-md dark:hover:border-indigo-800">
      <div>
        <div
          className="mb-5 h-1 rounded-full"
          style={{ backgroundColor: plan.color || '#6366f1' }}
        />

        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="line-clamp-2 text-base font-semibold leading-snug text-slate-950 dark:text-slate-100">
                {plan.title}
              </h3>
              {plan.aiGenerated && (
                <span
                  title="AI-generated study plan"
                  className="inline-flex items-center gap-0.5 rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
                >
                  <Sparkles className="h-2.5 w-2.5" />
                  AI
                </span>
              )}
            </div>
            <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
              {plan.subject}
            </p>
          </div>
          {onStatusChange ? (
            <select
              aria-label={`Status for ${plan.title}`}
              value={plan.status}
              onChange={(e) => onStatusChange(e.target.value as StudyPlan['status'])}
              className={`min-h-9 shrink-0 rounded-lg px-2 py-1 text-xs font-medium capitalize ring-1 focus:outline-none ${
                STATUS_COLORS[plan.status] ?? 'bg-gray-100 text-gray-600'
              }`}
            >
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          ) : (
            <span
              className={`shrink-0 rounded-md px-2 py-1 text-xs font-medium capitalize ring-1 ${
                STATUS_COLORS[plan.status] ?? 'bg-gray-100 text-gray-600'
              }`}
            >
              {plan.status.replace('_', ' ')}
            </span>
          )}
        </div>

        {plan.description && (
          <p className="mb-3 line-clamp-2 text-xs text-slate-600 dark:text-slate-400">
            {plan.description}
          </p>
        )}

        <div className="mb-4">
          <div className="mb-2 flex justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>
              {plan.completedHours}h done ({progress}%)
            </span>
            <span>{plan.targetHours}h total</span>
          </div>
          <div
            role="progressbar"
            aria-label={`${plan.title} progress`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"
          >
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${progress}%`, backgroundColor: plan.color || '#6366f1' }}
            />
          </div>
        </div>

        {parsedRoadmap && (
          <div className="mb-3">
            <button
              type="button"
              onClick={() => setShowRoadmap((v) => !v)}
              aria-expanded={showRoadmap}
              className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
            >
              {showRoadmap ? (
                <>
                  <ChevronUp className="h-3.5 w-3.5" />
                  Hide AI Roadmap
                </>
              ) : (
                <>
                  <ChevronDown className="h-3.5 w-3.5" />
                  View AI Roadmap ({parsedRoadmap.dailyPlan.length} days)
                </>
              )}
            </button>
            {showRoadmap && (
              <div className="mt-2 max-h-40 space-y-1.5 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs dark:border-slate-800 dark:bg-slate-900/60">
                {parsedRoadmap.dailyPlan.map((d) => (
                  <div key={d.day} className="text-slate-600 dark:text-slate-300">
                    <span className="font-semibold">Day {d.day}:</span> {d.focus}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800/80">
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Ends {new Date(plan.endDate).toLocaleDateString()}
        </span>
        <div className="flex items-center gap-1.5">
          {onLogHours && plan.status !== 'completed' && (
            <button
              type="button"
              onClick={() => onLogHours(0.5)}
              className="inline-flex min-h-11 items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              title="Log 30 minutes of study time"
            >
              <Clock className="h-3 w-3" aria-hidden="true" />
              +0.5h
            </button>
          )}
          <button
            onClick={onDelete}
            className="inline-flex h-11 w-11 items-center justify-center rounded-md text-slate-400 transition-colors duration-200 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-300"
            aria-label={`Delete ${plan.title}`}
            title="Delete plan"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
