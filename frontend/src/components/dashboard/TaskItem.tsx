import { Check, Trash2 } from 'lucide-react';
import type { Task } from '@/types';

interface TaskItemProps {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
}

const PRIORITY_COLORS: Record<string, string> = {
  urgent: 'text-red-600 dark:text-red-400',
  high: 'text-orange-600 dark:text-orange-400',
  medium: 'text-amber-600 dark:text-amber-400',
  low: 'text-emerald-600 dark:text-emerald-400',
};

export default function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  const isCompleted = task.status === 'completed';

  return (
    <div className="card flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:gap-4">
      <button
        onClick={onToggle}
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-200 ${
          isCompleted
            ? 'border-emerald-500 bg-emerald-500 text-white'
            : 'border-slate-300 hover:border-slate-500 dark:border-slate-600 dark:hover:border-slate-300'
        }`}
        aria-label={isCompleted ? 'Mark task as todo' : 'Mark task as complete'}
      >
        {isCompleted && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
      </button>

      <div className="min-w-0 flex-1">
        <p
          className={`text-sm font-medium ${
            isCompleted
              ? 'text-slate-400 line-through dark:text-slate-500'
              : 'text-slate-800 dark:text-slate-100'
          }`}
        >
          {task.title}
        </p>
        {task.dueDate && (
          <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
            Due {new Date(task.dueDate).toLocaleDateString()}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <span className={`shrink-0 text-xs font-medium capitalize ${PRIORITY_COLORS[task.priority] ?? 'text-slate-500 dark:text-slate-400'}`}>
          {task.priority}
        </span>

        <button
          onClick={onDelete}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-300"
          aria-label={`Delete ${task.title}`}
          title="Delete task"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
