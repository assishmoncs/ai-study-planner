'use client';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { apiClient } from '@/lib/api';
import TaskItem from '@/components/dashboard/TaskItem';
import CreateTaskModal from '@/components/dashboard/CreateTaskModal';
import type { Task } from '@/types';

const STATUS_FILTERS = ['all', 'todo', 'in_progress', 'completed'] as const;

export default function TasksPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['tasks', statusFilter],
    queryFn: () => {
      const params = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      return apiClient.get(`/tasks${params}`).then((r) => r.data.data.tasks as Task[]);
    },
  });

  const toggleComplete = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiClient.patch(`/tasks/${id}`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const deleteTask = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/tasks/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-100 sm:text-3xl">
            Tasks
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage your study tasks</p>
        </div>
        <button className="btn-primary w-full sm:w-auto" onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          New Task
        </button>
      </div>

      <div className="flex overflow-x-auto rounded-lg border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`min-w-fit flex-1 rounded-md px-3 py-2 text-xs font-medium capitalize transition-colors duration-200 ${
              statusFilter === s
                ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900'
            }`}
          >
            {s.replace('_', ' ')}
          </button>
        ))}
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
        </div>
      )}

      {!isLoading && data && data.length > 0 && (
        <div className="space-y-3">
          {data.map((task) => (
            <TaskItem
              key={task._id}
              task={task}
              onToggle={() =>
                toggleComplete.mutate({
                  id: task._id,
                  status: task.status === 'completed' ? 'todo' : 'completed',
                })
              }
              onDelete={() => deleteTask.mutate(task._id)}
            />
          ))}
        </div>
      )}

      {showModal && <CreateTaskModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
