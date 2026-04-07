import type { Task } from '@/types';

const PRIORITY_COLORS: Record<string, string> = {
  urgent: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-green-100 text-green-700',
};

export default function RecentTasks({ tasks }: { tasks: Task[] }) {
  return (
    <div className="card">
      <h2 className="text-base font-semibold text-slate-800 mb-4">Upcoming Tasks</h2>
      {tasks.length === 0 ? (
        <p className="text-slate-400 text-sm text-center py-6">No pending tasks 🎉</p>
      ) : (
        <ul className="divide-y divide-gray-50">
          {tasks.slice(0, 5).map((task) => (
            <li key={task._id} className="py-3 flex items-center justify-between gap-3">
              <span className="text-sm text-slate-700 truncate">{task.title}</span>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${
                  PRIORITY_COLORS[task.priority] ?? 'bg-gray-100 text-gray-600'
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
