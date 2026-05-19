import type { Task } from '@/types';

const PRIORITY_COLORS: Record<string, string> = {
  urgent: 'bg-red-50 text-red-700 ring-red-100 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-900/60',
  high: 'bg-orange-50 text-orange-700 ring-orange-100 dark:bg-orange-950/40 dark:text-orange-300 dark:ring-orange-900/60',
  medium: 'bg-amber-50 text-amber-700 ring-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900/60',
  low: 'bg-emerald-50 text-emerald-700 ring-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900/60',
};

export default function RecentTasks({ tasks }: { tasks: Task[] }) {
  return (
    <div className="card">
      <h2 className="mb-4 text-base font-semibold text-slate-800 dark:text-slate-100">Upcoming Tasks</h2>
      {tasks.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-400 dark:text-slate-500">No pending tasks</p>
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {tasks.slice(0, 5).map((task) => (
            <li key={task._id} className="flex items-center justify-between gap-3 py-3">
              <span className="truncate text-sm text-slate-700 dark:text-slate-200">{task.title}</span>
              <span
                className={`shrink-0 rounded-md px-2 py-1 text-xs font-medium capitalize ring-1 ${
                  PRIORITY_COLORS[task.priority] ?? 'bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700'
                }`}
              >
                {task.priority}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
