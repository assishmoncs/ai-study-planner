import type { Response } from 'express';
import type { ApiSuccessResponse, ApiErrorResponse } from '../types/index';

export const sendSuccess = <T>(
  res: Response,
  { statusCode = 200, message = 'Success', data }: { statusCode?: number; message?: string; data?: T }
): Response<ApiSuccessResponse<T>> => {
  const body: ApiSuccessResponse<T> = { success: true, message };
  if (data !== undefined) body.data = data;
  return res.status(statusCode).json(body);
};

export const sendError = (
  res: Response,
  { statusCode = 500, message = 'Internal server error', errors }: { statusCode?: number; message?: string; errors?: unknown }
): Response<ApiErrorResponse> => {
  const body: ApiErrorResponse = { success: false, message };
  if (errors) body.errors = errors as ApiErrorResponse['errors'];
  return res.status(statusCode).json(body);
};
