import type { Task } from '@/types';

interface TaskItemProps {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
}

const PRIORITY_COLORS: Record<string, string> = {
  urgent: 'text-red-600 dark:text-red-400',
  high: 'text-orange-600 dark:text-orange-400',
  medium: 'text-yellow-600 dark:text-yellow-400',
  low: 'text-green-600 dark:text-green-400',
};

export default function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  const isCompleted = task.status === 'completed';

  return (
    <div className="card flex items-center gap-4 py-4 px-5">
      <button
        onClick={onToggle}
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors duration-200 ${
          isCompleted
            ? 'bg-green-500 border-green-500 text-white'
            : 'border-slate-300 dark:border-slate-600 hover:border-primary-500'
        }`}
      >
        {isCompleted && (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-100'}`}>
          {task.title}
        </p>
        {task.dueDate && (
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            Due {new Date(task.dueDate).toLocaleDateString()}
          </p>
        )}
      </div>

      <span className={`text-xs font-medium shrink-0 ${PRIORITY_COLORS[task.priority] ?? 'text-slate-500 dark:text-slate-400'}`}>
        {task.priority}
      </span>

      <button
        onClick={onDelete}
        className="text-xs text-red-400 hover:text-red-600 transition-colors shrink-0"
      >
        Delete
      </button>
    </div>
  );
}
