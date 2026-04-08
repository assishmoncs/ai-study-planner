import type { Task } from '@/types';

const PRIORITY_COLORS: Record<string, string> = {
  urgent: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  high: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
  medium: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
  low: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
};

export default function RecentTasks({ tasks }: { tasks: Task[] }) {
  return (
    <div className="card">
      <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-4">Upcoming Tasks</h2>
      {tasks.length === 0 ? (
        <p className="text-slate-400 dark:text-slate-500 text-sm text-center py-6">No pending tasks 🎉</p>
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {tasks.slice(0, 5).map((task) => (
            <li key={task._id} className="py-3 flex items-center justify-between gap-3">
              <span className="text-sm text-slate-700 dark:text-slate-200 truncate">{task.title}</span>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${
                  PRIORITY_COLORS[task.priority] ?? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
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
