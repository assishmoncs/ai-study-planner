jest.mock('../src/models/StudyPlan', () => ({
  create: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn(),
  findOneAndDelete: jest.fn(),
}));

const StudyPlan = require('../src/models/StudyPlan');
const studyPlanService = require('../src/services/studyPlanService');

describe('studyPlanService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('logs study hours and marks plans as completed', async () => {
    const save = jest.fn().mockResolvedValue(true);
    StudyPlan.findOne.mockResolvedValue({
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
});
