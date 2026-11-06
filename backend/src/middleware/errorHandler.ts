import type { Response, NextFunction } from 'express';
import { sendError } from '../utils/responseHelper';
import logger from '../utils/logger';
import type { CustomRequest } from '../types/index';

/**
 * Centralized Express error-handling middleware.
 * Normalizes Mongoose validation/duplicate/cast errors, JWT errors, malformed JSON,
 * and operational AppErrors into a consistent JSON envelope.
 */
const errorHandler = (err: Error, req: CustomRequest, res: Response, _next: NextFunction) => {
  const requestId = req.id ? String(req.id) : undefined;
  (req.log || logger).error({ err, requestId }, err.message);

  if (err instanceof SyntaxError && 'body' in err) {
    return sendError(res, {
      statusCode: 400,
      message: 'Malformed JSON payload',
      code: 'MALFORMED_JSON',
      requestId,
    });
  }

  if (err.name === 'ValidationError') {
    const errors = Object.values(
      (err as Error & { errors: Record<string, { message: string }> }).errors
    ).map((e) => e.message);
    return sendError(res, {
      statusCode: 400,
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      errors,
      requestId,
    });
  }

  if ((err as Error & { code?: number }).code === 11000) {
    const field =
      Object.keys((err as Error & { keyValue?: Record<string, unknown> }).keyValue || {})[0] ||
      'field';
    return sendError(res, {
      statusCode: 409,
      message: `A record with that ${field} already exists`,
      code: 'DUPLICATE_KEY',
      requestId,
    });
  }

  if (err.name === 'CastError') {
    return sendError(res, {
      statusCode: 400,
      message: 'Invalid resource ID',
      code: 'INVALID_ID',
      requestId,
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return sendError(res, {
      statusCode: 401,
      message: 'Invalid token',
      code: 'INVALID_TOKEN',
      requestId,
    });
  }

  if (err.name === 'TokenExpiredError') {
    return sendError(res, {
      statusCode: 401,
      message: 'Token expired',
      code: 'TOKEN_EXPIRED',
      requestId,
    });
  }

  const statusCode = (err as Error & { statusCode?: number }).statusCode || 500;
  const code = (err as Error & { code?: string }).code;
  const isProd = process.env.NODE_ENV === 'production';
  const message =
    statusCode === 500 && isProd
      ? 'Internal server error'
      : err.message || 'Internal server error';

  sendError(res, { statusCode, message, code, requestId });
};

export default errorHandler;
