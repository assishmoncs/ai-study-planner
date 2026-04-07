const { validationResult } = require('express-validator');
const studyPlanService = require('../services/studyPlanService');
const aiService = require('../services/aiService');
const { sendSuccess, sendError } = require('../utils/responseHelper');

const createPlan = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, { statusCode: 400, message: 'Validation failed', errors: errors.array() });
    }

    const plan = await studyPlanService.create(req.user._id, req.body);
    sendSuccess(res, { statusCode: 201, message: 'Study plan created', data: { plan } });
  } catch (error) {
    next(error);
  }
};

const getPlans = async (req, res, next) => {
  try {
    const plans = await studyPlanService.getAll(req.user._id, req.query);
    sendSuccess(res, { data: { plans } });
  } catch (error) {
    next(error);
  }
};

const getPlan = async (req, res, next) => {
  try {
    const plan = await studyPlanService.getById(req.user._id, req.params.id);
    sendSuccess(res, { data: { plan } });
  } catch (error) {
    next(error);
  }
};

const updatePlan = async (req, res, next) => {
  try {
    const plan = await studyPlanService.update(req.user._id, req.params.id, req.body);
    sendSuccess(res, { message: 'Study plan updated', data: { plan } });
  } catch (error) {
    next(error);
  }
};

const deletePlan = async (req, res, next) => {
  try {
    await studyPlanService.remove(req.user._id, req.params.id);
    sendSuccess(res, { message: 'Study plan deleted' });
  } catch (error) {
    next(error);
  }
};

const logHours = async (req, res, next) => {
  try {
    const { hours } = req.body;
    if (typeof hours !== 'number' || hours <= 0) {
      return sendError(res, { statusCode: 400, message: 'hours must be a positive number' });
    }
    const plan = await studyPlanService.logHours(req.user._id, req.params.id, hours);
    sendSuccess(res, { message: 'Hours logged', data: { plan } });
  } catch (error) {
    next(error);
  }
};

const getAISuggestions = async (req, res, next) => {
  try {
    const { subject, daysAvailable, hoursPerDay, currentLevel } = req.body;
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

module.exports = { createPlan, getPlans, getPlan, updatePlan, deletePlan, logHours, getAISuggestions };
