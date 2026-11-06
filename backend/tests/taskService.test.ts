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

  it('filters tasks by allowed fields and search query', async () => {
    const sort = jest.fn().mockResolvedValue([]);
    (Task.find as jest.Mock).mockReturnValue({ populate: jest.fn().mockReturnValue({ sort }) });

    await taskService.getAll('user-1', {
      status: 'completed',
      priority: 'urgent',
      studyPlan: '64a1b2c3d4e5f6a7b8c9d0e1',
      search: 'chapter 3',
    });

    expect(Task.find).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'completed',
        priority: 'urgent',
        $or: expect.any(Array),
      })
    );
  });

  it('automatically stamps completedAt when updating task status to completed', async () => {
    (Task.findOneAndUpdate as jest.Mock).mockResolvedValue({
      _id: 'task-1',
      status: 'completed',
      completedAt: new Date(),
    });

    await taskService.update('user-1', 'task-1', { status: 'completed' });

    expect(Task.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'task-1', user: 'user-1' },
      expect.objectContaining({
        status: 'completed',
        completedAt: expect.any(Date),
      }),
      { new: true, runValidators: true }
    );
  });

  it('clears completedAt when reopening a completed task back to todo', async () => {
    (Task.findOneAndUpdate as jest.Mock).mockResolvedValue({
      _id: 'task-1',
      status: 'todo',
      completedAt: null,
    });

    await taskService.update('user-1', 'task-1', { status: 'todo' });

    expect(Task.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'task-1', user: 'user-1' },
      expect.objectContaining({
        status: 'todo',
        completedAt: null,
      }),
      { new: true, runValidators: true }
    );
  });
});
