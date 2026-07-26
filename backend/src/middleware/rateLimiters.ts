import rateLimit from 'express-rate-limit';
import type { CustomRequest } from '../types/index';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many auth requests, please try again later.',
  },
});

export const userLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => (req as unknown as CustomRequest).user?._id?.toString() || req.ip || 'unknown',
  message: {
    success: false,
    message: 'Too many requests, please slow down.',
  },
});
