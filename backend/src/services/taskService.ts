import mongoose from 'mongoose';
import * as taskRepository from '../repositories/taskRepository';
import AppError from '../utils/AppError';
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
  'studyPlan',
  'pomodoroSessions',
  'completedAt',
];

const escapeRegex = (str: string): string => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const sanitizeUpdate = (data: Record<string, unknown>): Record<string, unknown> => {
  const sanitized = ALLOWED_UPDATE_FIELDS.reduce<Record<string, unknown>>((acc, key) => {
    if (key in data && data[key] !== undefined) acc[key] = data[key];
    return acc;
  }, {});

  // Ensure completedAt is accurately maintained during findOneAndUpdate calls
  if ('status' in sanitized) {
    if (sanitized.status === 'completed' && !('completedAt' in sanitized)) {
      sanitized.completedAt = new Date();
    } else if (sanitized.status !== 'completed') {
      sanitized.completedAt = null;
    }
  }

  return sanitized;
};

/**
 * Creates a new task for the authenticated user.
 */
const create = async (userId: string, data: Record<string, unknown>): Promise<ITask> => {
  const payload: Record<string, unknown> = { ...data, user: userId };
  if (payload.status === 'completed' && !payload.completedAt) {
    payload.completedAt = new Date();
  }
  if (payload.studyPlan === '') {
    payload.studyPlan = null;
  }
  return taskRepository.createTask(payload);
};

/**
 * Lists tasks for a user with optional filtering by status, priority, studyPlan, dueDate, and search query.
 */
const getAll = async (userId: string, filters: TaskFilters = {}): Promise<ITask[]> => {
  const query: Record<string, unknown> = { user: userId };

  if (
    filters.status &&
    ALLOWED_STATUSES.includes(filters.status as (typeof ALLOWED_STATUSES)[number])
  ) {
    query.status = filters.status;
  }
  if (
    filters.priority &&
    ALLOWED_PRIORITIES.includes(filters.priority as (typeof ALLOWED_PRIORITIES)[number])
  ) {
    query.priority = filters.priority;
  }
  if (filters.studyPlan && mongoose.Types.ObjectId.isValid(filters.studyPlan)) {
    query.studyPlan = new mongoose.Types.ObjectId(filters.studyPlan);
  }
  if (filters.dueDate) {
    const parsedDate = new Date(filters.dueDate);
    if (!Number.isNaN(parsedDate.getTime())) {
      const endOfNextDay = new Date(parsedDate.getTime() + 24 * 60 * 60 * 1000);
      query.dueDate = { $lte: endOfNextDay };
    }
  }
  if (filters.search && String(filters.search).trim()) {
    const pattern = new RegExp(escapeRegex(String(filters.search).trim()), 'i');
    query.$or = [{ title: pattern }, { description: pattern }, { tags: pattern }];
  }

  return taskRepository.findTasks(query);
};

/**
 * Retrieves a single task by ID and user ownership.
 */
const getById = async (userId: string, taskId: string): Promise<ITask> => {
  const task = await taskRepository.findOneByUser(userId, taskId);
  if (!task) {
    throw new AppError('Task not found', 404, { code: 'TASK_NOT_FOUND' });
  }
  return task;
};

/**
 * Updates a task by ID and synchronizes `completedAt` timestamps when status changes.
 */
const update = async (
  userId: string,
  taskId: string,
  data: Record<string, unknown>
): Promise<ITask> => {
  const sanitized = sanitizeUpdate(data);
  if (sanitized.studyPlan === '') {
    sanitized.studyPlan = null;
  }
  const task = await taskRepository.updateOneByUser(userId, taskId, sanitized);
  if (!task) {
    throw new AppError('Task not found', 404, { code: 'TASK_NOT_FOUND' });
  }
  return task;
};

/**
 * Deletes a task by ID and user ownership.
 */
const remove = async (userId: string, taskId: string): Promise<ITask> => {
  const task = await taskRepository.deleteOneByUser(userId, taskId);
  if (!task) {
    throw new AppError('Task not found', 404, { code: 'TASK_NOT_FOUND' });
  }
  return task;
};

export { create, getAll, getById, update, remove };
