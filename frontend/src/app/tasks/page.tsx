'use client';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, CheckSquare } from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';
import LoadingState from '@/components/ui/LoadingState';
import QueryError from '@/components/ui/QueryError';
import { apiClient } from '@/lib/api';
import { useTasks } from '@/hooks/useTasks';
import TaskItem from '@/components/dashboard/TaskItem';
import CreateTaskModal from '@/components/dashboard/CreateTaskModal';
import { useToast } from '@/components/ui/Toaster';
import type { Task } from '@/types';

const STATUS_FILTERS = ['all', 'todo', 'in_progress', 'completed'] as const;
const PRIORITY_FILTERS = ['all', 'urgent', 'high', 'medium', 'low'] as const;

export default function TasksPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showModal, setShowModal] = useState(false);

  const { data, isLoading, isError, refetch } = useTasks({
    status: statusFilter,
    priority: priorityFilter,
    search: searchQuery,
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Task['status'] }) =>
      apiClient.patch(`/tasks/${id}`, { status }),
    onError: () => {
      toast({
        title: 'Could not save your changes',
        description: 'Please try again.',
        variant: 'error',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });

  const deleteTask = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/tasks/${id}`),
    onError: () => {
      toast({
        title: 'Could not save your changes',
        description: 'Please try again.',
        variant: 'error',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage your study tasks and track completion
          </p>
        </div>
        <button className="btn-primary w-full sm:w-auto" onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          New Task
        </button>
      </div>

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="filter-group">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              aria-pressed={statusFilter === s}
              onClick={() => setStatusFilter(s)}
              className={`filter-button ${
                statusFilter === s ? 'filter-active' : 'filter-inactive'
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
                {p === 'all'
                  ? 'All priorities'
                  : `${p.charAt(0).toUpperCase()}${p.slice(1)} priority`}
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
              aria-label="Search tasks"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="input !pl-9"
            />
          </div>
        </div>
      </div>

      {isLoading && <LoadingState variant="tasks" count={4} />}
      {isError && (
        <QueryError
          title="Could not load your tasks"
          onRetry={() => {
            void refetch();
          }}
        />
      )}
      {!isLoading && !isError && (!data || data.length === 0) && (
        <div className="card">
          <EmptyState
            icon={CheckSquare}
            title={
              statusFilter !== 'all' || priorityFilter !== 'all' || Boolean(searchQuery)
                ? 'No matches just yet'
                : 'Make room for your next step'
            }
            description={
              statusFilter !== 'all' || priorityFilter !== 'all' || Boolean(searchQuery)
                ? 'Try another search or clear your filters to see everything.'
                : 'Add a task to start building a little momentum.'
            }
          >
            {statusFilter !== 'all' || priorityFilter !== 'all' || Boolean(searchQuery) ? (
              <button
                className="btn-secondary"
                onClick={() => {
                  setStatusFilter('all');
                  setPriorityFilter('all');
                  setSearchQuery('');
                }}
              >
                Clear filters
              </button>
            ) : (
              <button className="btn-primary" onClick={() => setShowModal(true)}>
                <Plus className="h-4 w-4" />
                Create your first task
              </button>
            )}
          </EmptyState>
        </div>
      )}

      {!isLoading && data && data.length > 0 && (
        <fieldset
          disabled={updateStatus.isPending || deleteTask.isPending}
          aria-busy={updateStatus.isPending || deleteTask.isPending}
          className="space-y-3 min-w-0 border-0 p-0 disabled:opacity-70"
        >
          <legend className="sr-only">Study tasks</legend>
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
        </fieldset>
      )}

      {showModal && <CreateTaskModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
