import type { Types } from 'mongoose';
import Task from '../models/Task';
import StudyPlan from '../models/StudyPlan';
import type { StudyPlanStatus, TaskStatus } from '../types/index';

export interface TaskStats {
  _id: TaskStatus;
  count: number;
  totalMinutes: number;
}
export interface PlanStats {
  _id: StudyPlanStatus;
  count: number;
  totalTargetHours: number;
  totalCompletedHours: number;
}
export interface DailyActivity {
  _id: string;
  tasksCompleted: number;
  minutesStudied: number;
}
export interface SubjectStats {
  _id: string;
  totalTargetHours: number;
  totalCompletedHours: number;
  planCount: number;
}

export const aggregateTaskStatsByUser = async (user: Types.ObjectId): Promise<TaskStats[]> =>
  Task.aggregate<TaskStats>([
    { $match: { user } },
    { $group: { _id: '$status', count: { $sum: 1 }, totalMinutes: { $sum: '$actualMinutes' } } },
  ]);

export const aggregatePlanStatsByUser = async (user: Types.ObjectId): Promise<PlanStats[]> =>
  StudyPlan.aggregate<PlanStats>([
    { $match: { user } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalTargetHours: { $sum: '$targetHours' },
        totalCompletedHours: { $sum: '$completedHours' },
      },
    },
  ]);

export const aggregateDailyActivityByUser = async (
  user: Types.ObjectId,
  since: Date
): Promise<DailyActivity[]> =>
  Task.aggregate<DailyActivity>([
    { $match: { user, status: 'completed', completedAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } },
        tasksCompleted: { $sum: 1 },
        minutesStudied: { $sum: '$actualMinutes' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

export const aggregateSubjectBreakdownByUser = async (
  user: Types.ObjectId
): Promise<SubjectStats[]> =>
  StudyPlan.aggregate<SubjectStats>([
    { $match: { user } },
    {
      $group: {
        _id: '$subject',
        totalTargetHours: { $sum: '$targetHours' },
        totalCompletedHours: { $sum: '$completedHours' },
        planCount: { $sum: 1 },
      },
    },
    { $sort: { totalCompletedHours: -1 } },
  ]);
