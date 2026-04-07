const analyticsService = require('../services/analyticsService');
const { sendSuccess } = require('../utils/responseHelper');

const getSummary = async (req, res, next) => {
  try {
    const data = await analyticsService.getSummary(req.user._id);
    sendSuccess(res, { data });
  } catch (error) {
    next(error);
  }
};

const getDailyActivity = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days, 10) || 30;
    const data = await analyticsService.getDailyActivity(req.user._id, days);
    sendSuccess(res, { data: { activity: data } });
  } catch (error) {
    next(error);
  }
};

const getSubjectBreakdown = async (req, res, next) => {
  try {
    const data = await analyticsService.getSubjectBreakdown(req.user._id);
    sendSuccess(res, { data: { subjects: data } });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSummary, getDailyActivity, getSubjectBreakdown };
