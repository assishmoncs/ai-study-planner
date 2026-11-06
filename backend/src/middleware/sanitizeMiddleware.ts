import type { Request, Response, NextFunction } from 'express';

const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

/**
 * Recursively strips MongoDB query operators (`$`, `.`), prototype-pollution keys,
 * and dangerous ASCII null bytes from incoming request payloads.
 */
export const sanitizeValue = (value: unknown): unknown => {
  if (typeof value === 'string') {
    return value.replace(/\0/g, '');
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value && typeof value === 'object' && value.constructor === Object) {
    return Object.entries(value as Record<string, unknown>).reduce<Record<string, unknown>>(
      (acc, [key, nestedValue]) => {
        if (key.startsWith('$') || key.includes('.') || FORBIDDEN_KEYS.has(key)) {
          return acc;
        }
        acc[key] = sanitizeValue(nestedValue);
        return acc;
      },
      {}
    );
  }

  return value;
};

/**
 * Express middleware that sanitizes `req.body`, `req.query`, and `req.params`.
 */
const sanitizeRequest = (req: Request, _res: Response, next: NextFunction) => {
  if (req.body) req.body = sanitizeValue(req.body);
  if (req.query) req.query = sanitizeValue(req.query) as Request['query'];
  if (req.params) req.params = sanitizeValue(req.params) as Request['params'];
  next();
};

export default sanitizeRequest;
