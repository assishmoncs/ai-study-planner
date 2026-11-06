import StudyPlan from '../src/models/StudyPlan';
import * as studyPlanService from '../src/services/studyPlanService';

jest.mock('../src/models/StudyPlan', () => ({
  create: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn(),
  findOneAndDelete: jest.fn(),
}));

describe('studyPlanService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('logs study hours and marks plans as completed', async () => {
    const save = jest.fn().mockResolvedValue(true);
    (StudyPlan.findOne as jest.Mock).mockResolvedValue({
      completedHours: 4,
      targetHours: 5,
      status: 'active',
      save,
    });

    const result = await studyPlanService.logHours('user-1', 'plan-1', 1.5);

    expect(result.completedHours).toBe(5.5);
    expect(result.status).toBe('completed');
    expect(save).toHaveBeenCalled();
  });

  it('rejects study plan creation when endDate is before startDate', async () => {
    await expect(
      studyPlanService.create('user-1', {
        title: 'Invalid Dates Plan',
        subject: 'Math',
        startDate: '2026-06-10',
        endDate: '2026-06-01',
        targetHours: 10,
      })
    ).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it('applies status, priority, and search filters in getAll', async () => {
    const sort = jest.fn().mockResolvedValue([]);
    (StudyPlan.find as jest.Mock).mockReturnValue({ sort });

    await studyPlanService.getAll('user-1', {
      status: 'active',
      priority: 'high',
      search: 'algebra',
    });

    expect(StudyPlan.find).toHaveBeenCalledWith(
      expect.objectContaining({
        user: 'user-1',
        status: 'active',
        priority: 'high',
        $or: expect.any(Array),
      })
    );
  });
});
