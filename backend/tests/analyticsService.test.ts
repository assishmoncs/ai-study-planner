import mongoose from 'mongoose';
import Task from '../src/models/Task';
import StudyPlan from '../src/models/StudyPlan';
import * as analyticsService from '../src/services/analyticsService';

jest.mock('../src/models/Task', () => ({ aggregate: jest.fn() }));
jest.mock('../src/models/StudyPlan', () => ({ aggregate: jest.fn() }));

describe('analyticsService with restored repositories', () => {
  const userId = '64a1b2c3d4e5f6a7b8c9d0e1';
  const user = new mongoose.Types.ObjectId(userId);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('keeps both summary aggregations scoped to the requesting user', async () => {
    const taskStats = [{ _id: 'completed', count: 2, totalMinutes: 45 }];
    const planStats = [{ _id: 'active', count: 1, totalTargetHours: 10, totalCompletedHours: 3 }];
    (Task.aggregate as jest.Mock).mockResolvedValue(taskStats);
    (StudyPlan.aggregate as jest.Mock).mockResolvedValue(planStats);

    await expect(analyticsService.getSummary(userId)).resolves.toEqual({ taskStats, planStats });
    for (const aggregate of [Task.aggregate, StudyPlan.aggregate]) {
      expect(aggregate).toHaveBeenCalledWith(expect.arrayContaining([{ $match: { user } }]));
    }
  });

  it('limits daily activity to completed tasks in the requested date window', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-11-06T12:00:00Z'));
    const activity = [{ _id: '2026-11-05', tasksCompleted: 2, minutesStudied: 45 }];
    (Task.aggregate as jest.Mock).mockResolvedValue(activity);

    await expect(analyticsService.getDailyActivity(userId, 7)).resolves.toEqual(activity);
    expect(Task.aggregate).toHaveBeenCalledWith(
      expect.arrayContaining([
        {
          $match: {
            user,
            status: 'completed',
            completedAt: { $gte: new Date('2026-10-30T12:00:00Z') },
          },
        },
      ])
    );
  });

  it('returns the subject response fields without exposing other users’ plans', async () => {
    const subjects = [{ _id: 'Math', totalTargetHours: 10, totalCompletedHours: 3, planCount: 1 }];
    (StudyPlan.aggregate as jest.Mock).mockResolvedValue(subjects);

    await expect(analyticsService.getSubjectBreakdown(userId)).resolves.toEqual(subjects);
    expect(StudyPlan.aggregate).toHaveBeenCalledWith(
      expect.arrayContaining([{ $match: { user } }])
    );
  });
});
