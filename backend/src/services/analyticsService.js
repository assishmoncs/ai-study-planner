const Task = require('../models/Task');
const StudyPlan = require('../models/StudyPlan');

/**
 * Aggregate productivity stats for the authenticated user.
 */
const getSummary = async (userId) => {
  const [taskStats, planStats] = await Promise.all([
    Task.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalMinutes: { $sum: '$actualMinutes' },
        },
      },
    ]),
    StudyPlan.aggregate([
      { $match: { user: userId } },
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

/**
 * Return daily study time for the last N days.
 */
const getDailyActivity = async (userId, days = 30) => {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const activity = await Task.aggregate([
    {
      $match: {
        user: userId,
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

/**
 * Return per-subject breakdown.
 */
const getSubjectBreakdown = async (userId) => {
  return StudyPlan.aggregate([
    { $match: { user: userId } },
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

module.exports = { getSummary, getDailyActivity, getSubjectBreakdown };
