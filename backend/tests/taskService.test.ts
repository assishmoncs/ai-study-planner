import Task from '../src/models/Task';
import * as taskService from '../src/services/taskService';

jest.mock('../src/models/Task', () => ({
  create: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn(),
  findOneAndDelete: jest.fn(),
}));

describe('taskService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('filters tasks by allowed fields', async () => {
    const sort = jest.fn().mockResolvedValue([]);
    (Task.find as jest.Mock).mockReturnValue({ populate: jest.fn().mockReturnValue({ sort }) });

    await taskService.getAll('user-1', {
      status: 'completed',
      priority: 'urgent',
      studyPlan: '64a1b2c3d4e5f6a7b8c9d0e1',
    });

    expect(Task.find).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'completed',
        priority: 'urgent',
      })
    );
  });
});
