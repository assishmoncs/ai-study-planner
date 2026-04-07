const mongoose = require('mongoose');
const StudyPlan = require('../models/StudyPlan');

const ALLOWED_STATUSES = ['active', 'paused', 'completed', 'archived'];
const ALLOWED_UPDATE_FIELDS = ['title', 'subject', 'description', 'startDate', 'endDate', 'targetHours', 'status', 'priority', 'tags', 'color', 'aiSuggestions'];

/** Escape special regex characters from user input. */
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Pick only allowed fields from an update payload. */
const sanitizeUpdate = (data) =>
  ALLOWED_UPDATE_FIELDS.reduce((acc, key) => {
    if (key in data) acc[key] = data[key];
    return acc;
  }, {});

const create = async (userId, data) => {
  return StudyPlan.create({ ...data, user: userId });
};

const getAll = async (userId, filters = {}) => {
  const query = { user: userId };

  if (filters.status && ALLOWED_STATUSES.includes(filters.status)) query.status = filters.status;
  if (filters.subject) query.subject = new RegExp(escapeRegex(String(filters.subject)), 'i');

  return StudyPlan.find(query).sort({ createdAt: -1 });
};

const getById = async (userId, planId) => {
  const plan = await StudyPlan.findOne({ _id: planId, user: userId });
  if (!plan) {
    const error = new Error('Study plan not found');
    error.statusCode = 404;
    throw error;
  }
  return plan;
};

const update = async (userId, planId, data) => {
  const plan = await StudyPlan.findOneAndUpdate(
    { _id: planId, user: userId },
    sanitizeUpdate(data),
    { new: true, runValidators: true }
  );
  if (!plan) {
    const error = new Error('Study plan not found');
    error.statusCode = 404;
    throw error;
  }
  return plan;
};

const remove = async (userId, planId) => {
  const plan = await StudyPlan.findOneAndDelete({ _id: planId, user: userId });
  if (!plan) {
    const error = new Error('Study plan not found');
    error.statusCode = 404;
    throw error;
  }
  return plan;
};

const logHours = async (userId, planId, hours) => {
  const plan = await StudyPlan.findOne({ _id: planId, user: userId });
  if (!plan) {
    const error = new Error('Study plan not found');
    error.statusCode = 404;
    throw error;
  }

  plan.completedHours = Math.max(0, plan.completedHours + hours);
  if (plan.completedHours >= plan.targetHours) {
    plan.status = 'completed';
  }

  await plan.save();
  return plan;
};

module.exports = { create, getAll, getById, update, remove, logHours };
