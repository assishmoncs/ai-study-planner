import mongoose from 'mongoose';
import Task from '../models/Task';
import StudyPlan from '../models/StudyPlan';

const getSummary = async (userId: string) => {
  const oid = new mongoose.Types.ObjectId(userId);
  const [taskStats, planStats] = await Promise.all([
    Task.aggregate([
      { $match: { user: oid } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalMinutes: { $sum: '$actualMinutes' },
        },
      },
    ]),
    StudyPlan.aggregate([
      { $match: { user: oid } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalTargetHours: { $sum: '$targetHours' },
          totalCompletedHours: { $sum: '$completedHours' },
        },
      },
    ]),
  ]);

  return { taskStats, planStats };
};

const getDailyActivity = async (userId: string, days = 30) => {
  const oid = new mongoose.Types.ObjectId(userId);
  const since = new Date();
  since.setDate(since.getDate() - days);

  const activity = await Task.aggregate([
    {
      $match: {
        user: oid,
        status: 'completed',
        completedAt: { $gte: since },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$completedAt' },
        },
        tasksCompleted: { $sum: 1 },
        minutesStudied: { $sum: '$actualMinutes' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return activity;
};

const getSubjectBreakdown = async (userId: string) => {
  const oid = new mongoose.Types.ObjectId(userId);
  return StudyPlan.aggregate([
    { $match: { user: oid } },
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
};

export { getSummary, getDailyActivity, getSubjectBreakdown };
