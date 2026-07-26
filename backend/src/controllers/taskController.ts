import { validationResult } from 'express-validator';
import type { Response, NextFunction } from 'express';
import * as taskService from '../services/taskService';
import { sendSuccess, sendError } from '../utils/responseHelper';
import type { CustomRequest } from '../types/index';

const createTask = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, {
        statusCode: 400,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const task = await taskService.create(req.user!._id.toString(), req.body);
    sendSuccess(res, { statusCode: 201, message: 'Task created', data: { task } });
  } catch (error) {
    next(error);
  }
};

const getTasks = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const tasks = await taskService.getAll(req.user!._id.toString(), req.query as Record<string, string>);
    sendSuccess(res, { data: { tasks } });
  } catch (error) {
    next(error);
  }
};

const getTask = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const task = await taskService.getById(req.user!._id.toString(), req.params.id);
    sendSuccess(res, { data: { task } });
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const task = await taskService.update(req.user!._id.toString(), req.params.id, req.body);
    sendSuccess(res, { message: 'Task updated', data: { task } });
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    await taskService.remove(req.user!._id.toString(), req.params.id);
    sendSuccess(res, { message: 'Task deleted' });
  } catch (error) {
    next(error);
  }
};

export { createTask, getTasks, getTask, updateTask, deleteTask };
