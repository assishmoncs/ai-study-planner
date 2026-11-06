import { validationResult } from 'express-validator';
import type { Response, NextFunction } from 'express';
import * as taskService from '../services/taskService';
import * as aiService from '../services/aiService';
import { sendSuccess, sendError } from '../utils/responseHelper';
import type { CustomRequest, TaskFilters, AITaskSuggestionPayload } from '../types/index';

/**
 * Handles `POST /api/tasks`.
 */
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

/**
 * Handles `GET /api/tasks`.
 */
const getTasks = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const tasks = await taskService.getAll(
      req.user!._id.toString(),
      req.query as unknown as TaskFilters
    );
    sendSuccess(res, { data: { tasks } });
  } catch (error) {
    next(error);
  }
};

/**
 * Handles `GET /api/tasks/:id`.
 */
const getTask = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const task = await taskService.getById(req.user!._id.toString(), req.params.id);
    sendSuccess(res, { data: { task } });
  } catch (error) {
    next(error);
  }
};

/**
 * Handles `PATCH /api/tasks/:id`.
 */
const updateTask = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, {
        statusCode: 400,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const task = await taskService.update(req.user!._id.toString(), req.params.id, req.body);
    sendSuccess(res, { message: 'Task updated', data: { task } });
  } catch (error) {
    next(error);
  }
};

/**
 * Handles `DELETE /api/tasks/:id`.
 */
const deleteTask = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    await taskService.remove(req.user!._id.toString(), req.params.id);
    sendSuccess(res, { message: 'Task deleted' });
  } catch (error) {
    next(error);
  }
};

/**
 * Handles `POST /api/tasks/ai/suggest` to generate AI study tasks for a given subject.
 */
const suggestTasks = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, {
        statusCode: 400,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { subject, description } = req.body as AITaskSuggestionPayload;
    const tasks = await aiService.suggestTasks(subject, description);
    sendSuccess(res, { data: { tasks } });
  } catch (error) {
    next(error);
  }
};

export { createTask, getTasks, getTask, updateTask, deleteTask, suggestTasks };
