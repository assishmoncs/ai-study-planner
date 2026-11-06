'use client';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useTasks } from '@/hooks/useTasks';
import TaskItem from '@/components/dashboard/TaskItem';
import CreateTaskModal from '@/components/dashboard/CreateTaskModal';
import type { Task } from '@/types';

const STATUS_FILTERS = ['all', 'todo', 'in_progress', 'completed'] as const;
const PRIORITY_FILTERS = ['all', 'urgent', 'high', 'medium', 'low'] as const;

export default function TasksPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showModal, setShowModal] = useState(false);

  const { data, isLoading } = useTasks({
    status: statusFilter,
    priority: priorityFilter,
    search: searchQuery,
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Task['status'] }) =>
      apiClient.patch(`/tasks/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });

  const deleteTask = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/tasks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-100 sm:text-3xl">
            Tasks
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage your study tasks and track completion
          </p>
        </div>
        <button className="btn-primary w-full sm:w-auto" onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          New Task
        </button>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex overflow-x-auto rounded-lg border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`min-w-fit flex-1 rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors duration-200 ${
                statusFilter === s
                  ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900'
              }`}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <select
            aria-label="Filter by priority"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="input sm:w-40"
          >
            {PRIORITY_FILTERS.map((p) => (
              <option key={p} value={p}>
                {p === 'all' ? 'All priorities' : `${p.charAt(0).toUpperCase()}${p.slice(1)} priority`}
              </option>
            ))}
          </select>

          <div className="relative w-full sm:w-64">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="input !pl-9"
            />
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card h-16 animate-pulse bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
      )}

      {!isLoading && (!data || data.length === 0) && (
        <div className="card py-16 text-center">
          <p className="font-medium text-slate-700 dark:text-slate-200">No tasks found</p>
          <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
            Add a task or adjust your active filters
          </p>
        </div>
      )}

      {!isLoading && data && data.length > 0 && (
        <div className="space-y-3">
          {data.map((task) => (
            <TaskItem
              key={task._id}
              task={task}
              onToggle={() =>
                updateStatus.mutate({
                  id: task._id,
                  status: task.status === 'completed' ? 'todo' : 'completed',
                })
              }
              onStatusChange={(status) => updateStatus.mutate({ id: task._id, status })}
              onDelete={() => deleteTask.mutate(task._id)}
            />
          ))}
        </div>
      )}

      {showModal && <CreateTaskModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
