import StudyPlan from '../models/StudyPlan';
import type { IStudyPlan } from '../types/index';

export const createPlan = async (data: Record<string, unknown>): Promise<IStudyPlan> =>
  StudyPlan.create(data);

export const findPlans = async (query: Record<string, unknown>): Promise<IStudyPlan[]> =>
  StudyPlan.find(query).sort({ createdAt: -1 });

export const findOneByUser = async (userId: string, planId: string): Promise<IStudyPlan | null> =>
  StudyPlan.findOne({ _id: planId, user: userId });

export const updateOneByUser = async (
  userId: string,
  planId: string,
  updates: Record<string, unknown>
): Promise<IStudyPlan | null> =>
  StudyPlan.findOneAndUpdate({ _id: planId, user: userId }, updates, {
    new: true,
    runValidators: true,
  });

export const deleteOneByUser = async (userId: string, planId: string): Promise<IStudyPlan | null> =>
  StudyPlan.findOneAndDelete({ _id: planId, user: userId });
