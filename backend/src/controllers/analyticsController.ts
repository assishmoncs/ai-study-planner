import type { Response, NextFunction } from 'express';
import * as analyticsService from '../services/analyticsService';
import { sendSuccess } from '../utils/responseHelper';
import type { CustomRequest } from '../types/index';

const getSummary = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const data = await analyticsService.getSummary(req.user!._id.toString());
    sendSuccess(res, { data });
  } catch (error) {
    next(error);
  }
};

const getDailyActivity = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const days = parseInt(req.query.days as string, 10) || 30;
    const data = await analyticsService.getDailyActivity(req.user!._id.toString(), days);
    sendSuccess(res, { data: { activity: data } });
  } catch (error) {
    next(error);
  }
};

const getSubjectBreakdown = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const data = await analyticsService.getSubjectBreakdown(req.user!._id.toString());
    sendSuccess(res, { data: { subjects: data } });
  } catch (error) {
    next(error);
  }
};

export { getSummary, getDailyActivity, getSubjectBreakdown };
