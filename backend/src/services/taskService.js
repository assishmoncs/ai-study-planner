const mongoose = require('mongoose');
const Task = require('../models/Task');

const ALLOWED_STATUSES = ['todo', 'in_progress', 'completed', 'cancelled'];
const ALLOWED_PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const ALLOWED_UPDATE_FIELDS = ['title', 'description', 'dueDate', 'estimatedMinutes', 'actualMinutes', 'status', 'priority', 'tags', 'pomodoroSessions'];

/** Pick only allowed fields from an update payload. */
const sanitizeUpdate = (data) =>
  ALLOWED_UPDATE_FIELDS.reduce((acc, key) => {
    if (key in data) acc[key] = data[key];
    return acc;
  }, {});

const create = async (userId, data) => {
  return Task.create({ ...data, user: userId });
};

const getAll = async (userId, filters = {}) => {
  const query = { user: userId };

  if (filters.status && ALLOWED_STATUSES.includes(filters.status)) query.status = filters.status;
  if (filters.priority && ALLOWED_PRIORITIES.includes(filters.priority)) query.priority = filters.priority;
  if (filters.studyPlan && mongoose.Types.ObjectId.isValid(filters.studyPlan)) {
    query.studyPlan = new mongoose.Types.ObjectId(filters.studyPlan);
  }
  if (filters.dueDate) {
    const d = new Date(filters.dueDate);
    query.dueDate = { $lte: new Date(d.setDate(d.getDate() + 1)) };
  }

  return Task.find(query).populate('studyPlan', 'title subject color').sort({ dueDate: 1, priority: -1 });
};

const getById = async (userId, taskId) => {
  const task = await Task.findOne({ _id: taskId, user: userId }).populate(
    'studyPlan',
    'title subject color'
  );
  if (!task) {
    const error = new Error('Task not found');
    error.statusCode = 404;
    throw error;
  }
  return task;
};

const update = async (userId, taskId, data) => {
  const task = await Task.findOneAndUpdate(
    { _id: taskId, user: userId },
    sanitizeUpdate(data),
    { new: true, runValidators: true }
  );
  if (!task) {
    const error = new Error('Task not found');
    error.statusCode = 404;
    throw error;
  }
  return task;
};

const remove = async (userId, taskId) => {
  const task = await Task.findOneAndDelete({ _id: taskId, user: userId });
  if (!task) {
    const error = new Error('Task not found');
    error.statusCode = 404;
    throw error;
  }
  return task;
};

module.exports = { create, getAll, getById, update, remove };
