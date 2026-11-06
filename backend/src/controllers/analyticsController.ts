import type { Response, NextFunction } from 'express';
import * as analyticsService from '../services/analyticsService';
import { sendSuccess } from '../utils/responseHelper';
import type { CustomRequest } from '../types/index';

/**
 * Handles `GET /api/analytics/summary`.
 */
const getSummary = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const data = await analyticsService.getSummary(req.user!._id.toString());
    sendSuccess(res, { data });
  } catch (error) {
    next(error);
  }
};

/**
 * Handles `GET /api/analytics/daily`.
 */
const getDailyActivity = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const rawDays = parseInt(req.query.days as string, 10);
    const days = Number.isFinite(rawDays) && rawDays > 0 ? Math.min(365, rawDays) : 30;
    const data = await analyticsService.getDailyActivity(req.user!._id.toString(), days);
    sendSuccess(res, { data: { activity: data } });
  } catch (error) {
    next(error);
  }
};

/**
 * Handles `GET /api/analytics/subjects`.
 */
const getSubjectBreakdown = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const data = await analyticsService.getSubjectBreakdown(req.user!._id.toString());
    sendSuccess(res, { data: { subjects: data } });
  } catch (error) {
    next(error);
  }
};

export { getSummary, getDailyActivity, getSubjectBreakdown };
