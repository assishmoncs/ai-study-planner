import type { Request, Response, NextFunction } from 'express';

const sanitizeValue = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value && typeof value === 'object' && value.constructor === Object) {
    return Object.entries(value as Record<string, unknown>).reduce<Record<string, unknown>>((acc, [key, nestedValue]) => {
      if (key.startsWith('$') || key.includes('.') || key === '__proto__' || key === 'constructor')
        return acc;
      acc[key] = sanitizeValue(nestedValue);
      return acc;
    }, {});
  }

  return value;
};

const sanitizeRequest = (req: Request, _res: Response, next: NextFunction) => {
  req.body = sanitizeValue(req.body);
  req.query = sanitizeValue(req.query) as Request['query'];
  req.params = sanitizeValue(req.params) as Request['params'];
  next();
};

export default sanitizeRequest;
