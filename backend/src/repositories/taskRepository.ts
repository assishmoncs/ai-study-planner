import Task from '../models/Task';
import type { ITask } from '../types/index';

export const createTask = async (data: Record<string, unknown>): Promise<ITask> =>
  Task.create(data);

export const findTasks = async (query: Record<string, unknown>): Promise<ITask[]> =>
  Task.find(query).populate('studyPlan', 'title subject color').sort({ createdAt: -1 });

export const findOneByUser = async (userId: string, taskId: string): Promise<ITask | null> =>
  Task.findOne({ _id: taskId, user: userId });

export const updateOneByUser = async (
  userId: string,
  taskId: string,
  updates: Record<string, unknown>
): Promise<ITask | null> =>
  Task.findOneAndUpdate({ _id: taskId, user: userId }, updates, {
    new: true,
    runValidators: true,
  });

export const deleteOneByUser = async (userId: string, taskId: string): Promise<ITask | null> =>
  Task.findOneAndDelete({ _id: taskId, user: userId });
