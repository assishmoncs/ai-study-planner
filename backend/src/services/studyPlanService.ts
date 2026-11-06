import * as studyPlanRepository from '../repositories/studyPlanRepository';
import AppError from '../utils/AppError';
import type { IStudyPlan, StudyPlanFilters } from '../types/index';

const ALLOWED_STATUSES = ['active', 'paused', 'completed', 'archived'] as const;
const ALLOWED_PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const;
const ALLOWED_UPDATE_FIELDS = [
  'title',
  'subject',
  'description',
  'startDate',
  'endDate',
  'targetHours',
  'completedHours',
  'status',
  'priority',
  'tags',
  'color',
  'aiGenerated',
  'aiSuggestions',
];

const escapeRegex = (str: string): string => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const sanitizeUpdate = (data: Record<string, unknown>): Record<string, unknown> =>
  ALLOWED_UPDATE_FIELDS.reduce<Record<string, unknown>>((acc, key) => {
    if (key in data && data[key] !== undefined) acc[key] = data[key];
    return acc;
  }, {});

const validateDateOrder = (startDate?: unknown, endDate?: unknown): void => {
  if (!startDate || !endDate) return;
  const start = new Date(String(startDate));
  const end = new Date(String(endDate));
  if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && end < start) {
    throw new AppError('End date must be on or after the start date', 400, {
      code: 'INVALID_DATE_RANGE',
    });
  }
};

/**
 * Creates a new study plan for the specified user.
 */
const create = async (userId: string, data: Record<string, unknown>): Promise<IStudyPlan> => {
  validateDateOrder(data.startDate, data.endDate);
  return studyPlanRepository.createPlan({ ...data, user: userId });
};

/**
 * Retrieves all study plans for a user matching optional status, priority, subject, or search filters.
 */
const getAll = async (userId: string, filters: StudyPlanFilters = {}): Promise<IStudyPlan[]> => {
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
  if (filters.subject) {
    query.subject = new RegExp(escapeRegex(String(filters.subject).trim()), 'i');
  }
  if (filters.search && String(filters.search).trim()) {
    const pattern = new RegExp(escapeRegex(String(filters.search).trim()), 'i');
    query.$or = [{ title: pattern }, { subject: pattern }, { description: pattern }];
  }

  return studyPlanRepository.findPlans(query);
};

/**
 * Retrieves a single study plan by ID, verifying ownership.
 */
const getById = async (userId: string, planId: string): Promise<IStudyPlan> => {
  const plan = await studyPlanRepository.findOneByUser(userId, planId);
  if (!plan) {
    throw new AppError('Study plan not found', 404, { code: 'PLAN_NOT_FOUND' });
  }
  return plan;
};

/**
 * Updates an existing study plan with whitelisted fields.
 */
const update = async (
  userId: string,
  planId: string,
  data: Record<string, unknown>
): Promise<IStudyPlan> => {
  validateDateOrder(data.startDate, data.endDate);
  const sanitized = sanitizeUpdate(data);
  const plan = await studyPlanRepository.updateOneByUser(userId, planId, sanitized);
  if (!plan) {
    throw new AppError('Study plan not found', 404, { code: 'PLAN_NOT_FOUND' });
  }
  return plan;
};

/**
 * Deletes a study plan by ID, verifying ownership.
 */
const remove = async (userId: string, planId: string): Promise<IStudyPlan> => {
  const plan = await studyPlanRepository.deleteOneByUser(userId, planId);
  if (!plan) {
    throw new AppError('Study plan not found', 404, { code: 'PLAN_NOT_FOUND' });
  }
  return plan;
};

/**
 * Logs completed study hours to a study plan and automatically transitions
 * the status to `completed` once `completedHours >= targetHours`.
 */
const logHours = async (userId: string, planId: string, hours: number): Promise<IStudyPlan> => {
  const numericHours = Number(hours);
  if (!Number.isFinite(numericHours) || numericHours <= 0) {
    throw new AppError('Hours must be a positive number', 400, { code: 'INVALID_HOURS' });
  }

  const plan = await studyPlanRepository.findOneByUser(userId, planId);
  if (!plan) {
    throw new AppError('Study plan not found', 404, { code: 'PLAN_NOT_FOUND' });
  }

  plan.completedHours = Math.max(0, parseFloat((plan.completedHours + numericHours).toFixed(2)));
  if (plan.completedHours >= plan.targetHours) {
    plan.status = 'completed';
  }

  await plan.save();
  return plan;
};

export { create, getAll, getById, update, remove, logHours };
