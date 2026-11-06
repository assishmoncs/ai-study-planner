import type { Response } from 'express';
import type { ApiSuccessResponse, ApiErrorResponse } from '../types/index';

/**
 * Sends a standardized JSON success response.
 */
export const sendSuccess = <T>(
  res: Response,
  {
    statusCode = 200,
    message = 'Success',
    data,
  }: { statusCode?: number; message?: string; data?: T }
): Response<ApiSuccessResponse<T>> => {
  const body: ApiSuccessResponse<T> = { success: true, message };
  if (data !== undefined) body.data = data;
  return res.status(statusCode).json(body);
};

/**
 * Sends a standardized JSON error response.
 */
export const sendError = (
  res: Response,
  {
    statusCode = 500,
    message = 'Internal server error',
    errors,
    code,
    requestId,
  }: {
    statusCode?: number;
    message?: string;
    errors?: unknown;
    code?: string;
    requestId?: string;
  }
): Response<ApiErrorResponse> => {
  const body: ApiErrorResponse = { success: false, message };
  if (code) body.code = code;
  if (requestId) body.requestId = requestId;
  if (errors) body.errors = errors as ApiErrorResponse['errors'];
  return res.status(statusCode).json(body);
};
