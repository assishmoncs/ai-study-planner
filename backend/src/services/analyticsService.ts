import mongoose from 'mongoose';
import * as analyticsRepository from '../repositories/analyticsRepository';

const MIN_DAYS = 1;
const MAX_DAYS = 365;

const clampDays = (days: number): number => {
  if (!Number.isFinite(days) || days < MIN_DAYS) return 30;
  return Math.min(MAX_DAYS, Math.round(days));
};

/**
 * Aggregates high-level task and study plan statistics grouped by status.
 */
const getSummary = async (userId: string) => {
  const oid = new mongoose.Types.ObjectId(userId);
  const [taskStats, planStats] = await Promise.all([
    analyticsRepository.aggregateTaskStatsByUser(oid),
    analyticsRepository.aggregatePlanStatsByUser(oid),
  ]);

  return { taskStats, planStats };
};

/**
 * Retrieves daily completed task count and minutes studied for the past `days` window.
 */
const getDailyActivity = async (userId: string, days = 30) => {
  const oid = new mongoose.Types.ObjectId(userId);
  const safeDays = clampDays(days);
  const since = new Date();
  since.setDate(since.getDate() - safeDays);

  return analyticsRepository.aggregateDailyActivityByUser(oid, since);
};

/**
 * Aggregates study plan target and completed hours grouped by academic subject.
 */
const getSubjectBreakdown = async (userId: string) => {
  const oid = new mongoose.Types.ObjectId(userId);
  return analyticsRepository.aggregateSubjectBreakdownByUser(oid);
};

export { getSummary, getDailyActivity, getSubjectBreakdown };
