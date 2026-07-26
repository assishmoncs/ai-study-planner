import StudyPlan from '../models/StudyPlan';
import type { IStudyPlan, StudyPlanFilters } from '../types/index';

const ALLOWED_STATUSES = ['active', 'paused', 'completed', 'archived'] as const;
const ALLOWED_UPDATE_FIELDS = [
  'title',
  'subject',
  'description',
  'startDate',
  'endDate',
  'targetHours',
  'status',
  'priority',
  'tags',
  'color',
  'aiSuggestions',
];

const escapeRegex = (str: string): string => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const sanitizeUpdate = (data: Record<string, unknown>): Record<string, unknown> =>
  ALLOWED_UPDATE_FIELDS.reduce<Record<string, unknown>>((acc, key) => {
    if (key in data) acc[key] = data[key];
    return acc;
  }, {});

const create = async (userId: string, data: Record<string, unknown>): Promise<IStudyPlan> => {
  return StudyPlan.create({ ...data, user: userId });
};

const getAll = async (userId: string, filters: StudyPlanFilters = {}): Promise<IStudyPlan[]> => {
  const query: Record<string, unknown> = { user: userId };

  if (filters.status && ALLOWED_STATUSES.includes(filters.status as typeof ALLOWED_STATUSES[number])) {
    query.status = filters.status;
  }
  if (filters.subject) query.subject = new RegExp(escapeRegex(String(filters.subject)), 'i');

  return StudyPlan.find(query).sort({ createdAt: -1 });
};

const getById = async (userId: string, planId: string): Promise<IStudyPlan> => {
  const plan = await StudyPlan.findOne({ _id: planId, user: userId });
  if (!plan) {
    const error = new Error('Study plan not found') as Error & { statusCode: number };
    error.statusCode = 404;
    throw error;
  }
  return plan;
};

const update = async (userId: string, planId: string, data: Record<string, unknown>): Promise<IStudyPlan> => {
  const plan = await StudyPlan.findOneAndUpdate(
    { _id: planId, user: userId },
    sanitizeUpdate(data),
    { new: true, runValidators: true }
  );
  if (!plan) {
    const error = new Error('Study plan not found') as Error & { statusCode: number };
    error.statusCode = 404;
    throw error;
  }
  return plan;
};

const remove = async (userId: string, planId: string): Promise<IStudyPlan> => {
  const plan = await StudyPlan.findOneAndDelete({ _id: planId, user: userId });
  if (!plan) {
    const error = new Error('Study plan not found') as Error & { statusCode: number };
    error.statusCode = 404;
    throw error;
  }
  return plan;
};

const logHours = async (userId: string, planId: string, hours: number): Promise<IStudyPlan> => {
  const plan = await StudyPlan.findOne({ _id: planId, user: userId });
  if (!plan) {
    const error = new Error('Study plan not found') as Error & { statusCode: number };
    error.statusCode = 404;
    throw error;
  }

  plan.completedHours = Math.max(0, parseFloat((plan.completedHours + Number(hours)).toFixed(2)));
  if (plan.completedHours >= plan.targetHours) {
    plan.status = 'completed';
  }

  await plan.save();
  return plan;
};

export { create, getAll, getById, update, remove, logHours };
