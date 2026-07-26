import { verifyAccessToken } from '../utils/jwtUtils';
import User from '../models/User';
import { sendError } from '../utils/responseHelper';
import type { Response, NextFunction } from 'express';
import type { CustomRequest } from '../types/index';

export const protect = async (req: CustomRequest, res: Response, next: NextFunction) => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return sendError(res, { statusCode: 401, message: 'Not authorized – no token provided' });
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = await User.findById(decoded.id).select('-password -refreshToken') ?? undefined;

    if (!req.user) {
      return sendError(res, {
        statusCode: 401,
        message: 'User belonging to this token no longer exists',
      });
    }

    next();
  } catch {
    return sendError(res, { statusCode: 401, message: 'Not authorized – invalid token' });
  }
};
