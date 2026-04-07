const Task = require('../models/Task');

const create = async (userId, data) => {
  return Task.create({ ...data, user: userId });
};

const getAll = async (userId, filters = {}) => {
  const query = { user: userId };

  if (filters.status) query.status = filters.status;
  if (filters.priority) query.priority = filters.priority;
  if (filters.studyPlan) query.studyPlan = filters.studyPlan;
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
    data,
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
