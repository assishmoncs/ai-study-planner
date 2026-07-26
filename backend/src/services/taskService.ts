import mongoose from 'mongoose';
import Task from '../models/Task';
import type { ITask, TaskFilters } from '../types/index';

const ALLOWED_STATUSES = ['todo', 'in_progress', 'completed', 'cancelled'] as const;
const ALLOWED_PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const;
const ALLOWED_UPDATE_FIELDS = [
  'title',
  'description',
  'dueDate',
  'estimatedMinutes',
  'actualMinutes',
  'status',
  'priority',
  'tags',
  'pomodoroSessions',
];

const sanitizeUpdate = (data: Record<string, unknown>): Record<string, unknown> =>
  ALLOWED_UPDATE_FIELDS.reduce<Record<string, unknown>>((acc, key) => {
    if (key in data) acc[key] = data[key];
    return acc;
  }, {});

const create = async (userId: string, data: Record<string, unknown>): Promise<ITask> => {
  return Task.create({ ...data, user: userId });
};

const getAll = async (userId: string, filters: TaskFilters = {}): Promise<ITask[]> => {
  const query: Record<string, unknown> = { user: userId };

  if (filters.status && ALLOWED_STATUSES.includes(filters.status as typeof ALLOWED_STATUSES[number])) {
    query.status = filters.status;
  }
  if (filters.priority && ALLOWED_PRIORITIES.includes(filters.priority as typeof ALLOWED_PRIORITIES[number])) {
    query.priority = filters.priority;
  }
  if (filters.studyPlan && mongoose.Types.ObjectId.isValid(filters.studyPlan)) {
    query.studyPlan = new mongoose.Types.ObjectId(filters.studyPlan);
  }
  if (filters.dueDate) {
    const d = new Date(filters.dueDate);
    query.dueDate = { $lte: new Date(d.setDate(d.getDate() + 1)) };
  }

  return Task.find(query)
    .populate('studyPlan', 'title subject color')
    .sort({ dueDate: 1, priority: -1 });
};

const getById = async (userId: string, taskId: string): Promise<ITask> => {
  const task = await Task.findOne({ _id: taskId, user: userId }).populate(
    'studyPlan',
    'title subject color'
  );
  if (!task) {
    const error = new Error('Task not found') as Error & { statusCode: number };
    error.statusCode = 404;
    throw error;
  }
  return task;
};

const update = async (userId: string, taskId: string, data: Record<string, unknown>): Promise<ITask> => {
  const task = await Task.findOneAndUpdate({ _id: taskId, user: userId }, sanitizeUpdate(data), {
    new: true,
    runValidators: true,
  });
  if (!task) {
    const error = new Error('Task not found') as Error & { statusCode: number };
    error.statusCode = 404;
    throw error;
  }
  return task;
};

const remove = async (userId: string, taskId: string): Promise<ITask> => {
  const task = await Task.findOneAndDelete({ _id: taskId, user: userId });
  if (!task) {
    const error = new Error('Task not found') as Error & { statusCode: number };
    error.statusCode = 404;
    throw error;
  }
  return task;
};

export { create, getAll, getById, update, remove };
