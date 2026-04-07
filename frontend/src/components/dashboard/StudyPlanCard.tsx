import type { StudyPlan } from '@/types';

interface StudyPlanCardProps {
  plan: StudyPlan;
  onDelete: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  paused: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-blue-100 text-blue-700',
  archived: 'bg-gray-100 text-gray-600',
};

export default function StudyPlanCard({ plan, onDelete }: StudyPlanCardProps) {
  const progress = plan.targetHours > 0
    ? Math.min(Math.round((plan.completedHours / plan.targetHours) * 100), 100)
    : 0;

  return (
    <div className="card hover:shadow-md transition-shadow">
      {/* Color accent */}
      <div className="h-1.5 rounded-full mb-4" style={{ backgroundColor: plan.color || '#6366f1' }} />

      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <h3 className="font-semibold text-slate-800 text-sm leading-tight">{plan.title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{plan.subject}</p>
        </div>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${
            STATUS_COLORS[plan.status] ?? 'bg-gray-100 text-gray-600'
          }`}
        >
          {plan.status}
        </span>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>{plan.completedHours}h done</span>
          <span>{plan.targetHours}h total</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${progress}%`, backgroundColor: plan.color || '#6366f1' }}
          />
        </div>
        <p className="text-xs text-slate-500 mt-1 text-right">{progress}%</p>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-xs text-slate-400">
          {new Date(plan.endDate).toLocaleDateString()}
        </span>
        <button
          onClick={onDelete}
          className="text-xs text-red-400 hover:text-red-600 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
