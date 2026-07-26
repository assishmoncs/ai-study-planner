import { validationResult } from 'express-validator';
import type { Response, NextFunction } from 'express';
import * as studyPlanService from '../services/studyPlanService';
import * as aiService from '../services/aiService';
import { sendSuccess, sendError } from '../utils/responseHelper';
import type { CustomRequest, AIGeneratePayload } from '../types/index';

const createPlan = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, {
        statusCode: 400,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const plan = await studyPlanService.create(req.user!._id.toString(), req.body);
    sendSuccess(res, { statusCode: 201, message: 'Study plan created', data: { plan } });
  } catch (error) {
    next(error);
  }
};

const getPlans = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const plans = await studyPlanService.getAll(req.user!._id.toString(), req.query as Record<string, string>);
    sendSuccess(res, { data: { plans } });
  } catch (error) {
    next(error);
  }
};

const getPlan = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const plan = await studyPlanService.getById(req.user!._id.toString(), req.params.id);
    sendSuccess(res, { data: { plan } });
  } catch (error) {
    next(error);
  }
};

const updatePlan = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const plan = await studyPlanService.update(req.user!._id.toString(), req.params.id, req.body);
    sendSuccess(res, { message: 'Study plan updated', data: { plan } });
  } catch (error) {
    next(error);
  }
};

const deletePlan = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    await studyPlanService.remove(req.user!._id.toString(), req.params.id);
    sendSuccess(res, { message: 'Study plan deleted' });
  } catch (error) {
    next(error);
  }
};

const logHours = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, {
        statusCode: 400,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { hours } = req.body as { hours: number };
    const plan = await studyPlanService.logHours(req.user!._id.toString(), req.params.id, hours);
    sendSuccess(res, { message: 'Hours logged', data: { plan } });
  } catch (error) {
    next(error);
  }
};

const getAISuggestions = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const { subject, daysAvailable, hoursPerDay, currentLevel } = req.body as AIGeneratePayload;
    const suggestions = await aiService.generateStudyPlan({
      subject,
      daysAvailable,
      hoursPerDay,
      currentLevel,
    });
    sendSuccess(res, { data: { suggestions } });
  } catch (error) {
    next(error);
  }
};

export {
  createPlan,
  getPlans,
  getPlan,
  updatePlan,
  deletePlan,
  logHours,
  getAISuggestions,
};
