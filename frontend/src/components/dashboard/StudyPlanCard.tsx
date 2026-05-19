import { Trash2 } from 'lucide-react';
import type { StudyPlan } from '@/types';

interface StudyPlanCardProps {
  plan: StudyPlan;
  onDelete: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 ring-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900/60',
  paused: 'bg-amber-50 text-amber-700 ring-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900/60',
  completed: 'bg-blue-50 text-blue-700 ring-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-900/60',
  archived: 'bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700',
};

export default function StudyPlanCard({ plan, onDelete }: StudyPlanCardProps) {
  const progress = plan.targetHours > 0
    ? Math.min(Math.round((plan.completedHours / plan.targetHours) * 100), 100)
    : 0;

  return (
    <div className="card hover:shadow-md transition-shadow duration-200">
      <div className="mb-4 h-1 rounded-full" style={{ backgroundColor: plan.color || '#2563eb' }} />

      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold leading-tight text-slate-950 dark:text-slate-100">
            {plan.title}
          </h3>
          <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">{plan.subject}</p>
        </div>
        <span
          className={`shrink-0 rounded-md px-2 py-1 text-xs font-medium capitalize ring-1 ${
            STATUS_COLORS[plan.status] ?? 'bg-gray-100 text-gray-600'
          }`}
        >
          {plan.status.replace('_', ' ')}
        </span>
      </div>

      <div className="mb-4">
        <div className="mb-2 flex justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>{plan.completedHours}h done</span>
          <span>{plan.targetHours}h total</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${progress}%`, backgroundColor: plan.color || '#2563eb' }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400 dark:text-slate-500">
          Ends {new Date(plan.endDate).toLocaleDateString()}
        </span>
        <button
          onClick={onDelete}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition-colors duration-200 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-300"
          aria-label={`Delete ${plan.title}`}
          title="Delete plan"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
