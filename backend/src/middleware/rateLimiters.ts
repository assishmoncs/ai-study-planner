import rateLimit from 'express-rate-limit';
import type { CustomRequest } from '../types/index';

/**
 * Rate limiter for authentication endpoints (login, register, token refresh).
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many auth requests, please try again later.',
    code: 'AUTH_RATE_LIMITED',
  },
});

/**
 * Rate limiter for authenticated user CRUD and analytics endpoints.
 */
export const userLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) =>
    (req as unknown as CustomRequest).user?._id?.toString() || req.ip || 'unknown',
  message: {
    success: false,
    message: 'Too many requests, please slow down.',
    code: 'USER_RATE_LIMITED',
  },
});

/**
 * Strict rate limiter for AI generation endpoints to protect LLM token budgets.
 */
export const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) =>
    (req as unknown as CustomRequest).user?._id?.toString() || req.ip || 'unknown',
  message: {
    success: false,
    message: 'AI generation rate limit reached. Please wait a few minutes before trying again.',
    code: 'AI_RATE_LIMITED',
  },
});
