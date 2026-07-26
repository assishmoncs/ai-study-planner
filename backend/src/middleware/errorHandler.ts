import type { Response, NextFunction } from 'express';
import { sendError } from '../utils/responseHelper';
import logger from '../utils/logger';
import type { CustomRequest } from '../types/index';

const errorHandler = (err: Error, req: CustomRequest, res: Response, _next: NextFunction) => {
  (req.log || logger).error({ err }, err.message);

  if (err.name === 'ValidationError') {
    const errors = Object.values((err as Error & { errors: Record<string, { message: string }> }).errors).map(
      (e) => e.message
    );
    return sendError(res, { statusCode: 400, message: 'Validation failed', errors });
  }

  if ((err as Error & { code?: number }).code === 11000) {
    const field = Object.keys((err as Error & { keyValue?: Record<string, unknown> }).keyValue || {})[0];
    return sendError(res, {
      statusCode: 409,
      message: `A record with that ${field} already exists`,
    });
  }

  if (err.name === 'CastError') {
    return sendError(res, { statusCode: 400, message: 'Invalid resource ID' });
  }

  if (err.name === 'JsonWebTokenError') {
    return sendError(res, { statusCode: 401, message: 'Invalid token' });
  }
  if (err.name === 'TokenExpiredError') {
    return sendError(res, { statusCode: 401, message: 'Token expired' });
  }

  const statusCode = (err as Error & { statusCode?: number }).statusCode || 500;
  const message = err.message || 'Internal server error';
  sendError(res, { statusCode, message });
};

export default errorHandler;
