const { validationResult } = require('express-validator');
const taskService = require('../services/taskService');
const { sendSuccess, sendError } = require('../utils/responseHelper');

const createTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, { statusCode: 400, message: 'Validation failed', errors: errors.array() });
    }

    const task = await taskService.create(req.user._id, req.body);
    sendSuccess(res, { statusCode: 201, message: 'Task created', data: { task } });
  } catch (error) {
    next(error);
  }
};

const getTasks = async (req, res, next) => {
  try {
    const tasks = await taskService.getAll(req.user._id, req.query);
    sendSuccess(res, { data: { tasks } });
  } catch (error) {
    next(error);
  }
};

const getTask = async (req, res, next) => {
  try {
    const task = await taskService.getById(req.user._id, req.params.id);
    sendSuccess(res, { data: { task } });
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const task = await taskService.update(req.user._id, req.params.id, req.body);
    sendSuccess(res, { message: 'Task updated', data: { task } });
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    await taskService.remove(req.user._id, req.params.id);
    sendSuccess(res, { message: 'Task deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createTask, getTasks, getTask, updateTask, deleteTask };
