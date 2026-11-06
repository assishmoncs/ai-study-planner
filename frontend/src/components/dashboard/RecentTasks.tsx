import Link from 'next/link';
import { ArrowUpRight, CheckSquare, Circle } from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';
import type { Task } from '@/types';

const PRIORITY_COLORS: Record<string, string> = {
  urgent:
    'bg-red-50 text-red-700 ring-red-100 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-900/60',
  high: 'bg-orange-50 text-orange-700 ring-orange-100 dark:bg-orange-950/40 dark:text-orange-300 dark:ring-orange-900/60',
  medium:
    'bg-amber-50 text-amber-700 ring-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900/60',
  low: 'bg-emerald-50 text-emerald-700 ring-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900/60',
};

export default function RecentTasks({ tasks }: { tasks: Task[] }) {
  return (
    <div className="card">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">Up next</h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            A clear next step for your study day.
          </p>
        </div>
        <Link
          href="/tasks"
          className="inline-flex min-h-11 items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400"
        >
          All tasks
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
      {tasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="A clear slate"
          description="No pending tasks. Add your next step whenever you’re ready."
        >
          <Link href="/tasks" className="btn-secondary">
            Manage tasks
          </Link>
        </EmptyState>
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {tasks.slice(0, 5).map((task) => (
            <li key={task._id} className="flex items-center justify-between gap-3 py-3">
              <Link
                href="/tasks"
                className="flex min-w-0 items-center gap-3 text-sm text-slate-700 hover:text-indigo-600 dark:text-slate-200 dark:hover:text-indigo-300"
              >
                <Circle className="h-4 w-4 shrink-0 text-slate-300 dark:text-slate-600" />
                <span className="truncate">{task.title}</span>
              </Link>
              <span
                className={`shrink-0 rounded-md px-2 py-1 text-xs font-medium capitalize ring-1 ${
                  PRIORITY_COLORS[task.priority] ??
                  'bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700'
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
