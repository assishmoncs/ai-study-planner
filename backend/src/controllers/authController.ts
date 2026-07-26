import { validationResult } from 'express-validator';
import type { Response, NextFunction } from 'express';
import * as authService from '../services/authService';
import { sendSuccess, sendError } from '../utils/responseHelper';
import { buildRefreshCookieOptions, verifyRefreshToken } from '../utils/jwtUtils';
import type { CustomRequest, LoginPayload, RegisterPayload, ProfileUpdatePayload } from '../types/index';

const extractRefreshToken = (req: CustomRequest): { token?: string; error?: string } => {
  try {
    const cookieHeader = req.headers.cookie || '';
    const cookies = cookieHeader.split(';').reduce<Record<string, string>>((acc, pair) => {
      const [rawKey, ...rawValue] = pair.trim().split('=');
      if (!rawKey) return acc;
      acc[rawKey] = decodeURIComponent(rawValue.join('=') || '');
      return acc;
    }, {});
    return { token: req.cookies?.refreshToken || cookies.refreshToken || '' };
  } catch {
    return { error: 'Malformed cookie header' };
  }
};

const register = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, {
        statusCode: 400,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { name, email, password } = req.body as RegisterPayload;
    const { user, accessToken, refreshToken } = await authService.register({
      name,
      email,
      password,
    });
    res.cookie('refreshToken', refreshToken, buildRefreshCookieOptions());

    sendSuccess(res, {
      statusCode: 201,
      message: 'Registration successful',
      data: { user, accessToken },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, {
        statusCode: 400,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { email, password } = req.body as LoginPayload;
    const { user, accessToken, refreshToken } = await authService.login({ email, password });
    res.cookie('refreshToken', refreshToken, buildRefreshCookieOptions());

    sendSuccess(res, { message: 'Login successful', data: { user, accessToken } });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const user = await authService.getProfile(req.user!._id.toString());
    sendSuccess(res, { data: { user } });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const user = await authService.updateProfile(req.user!._id.toString(), req.body as ProfileUpdatePayload);
    sendSuccess(res, { message: 'Profile updated', data: { user } });
  } catch (error) {
    next(error);
  }
};

const refresh = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const extraction = extractRefreshToken(req);
    if (extraction.error) {
      return sendError(res, { statusCode: 400, message: extraction.error });
    }
    const { token: refreshToken } = extraction;
    if (!refreshToken) {
      return sendError(res, { statusCode: 401, message: 'Refresh token is required' });
    }

    const {
      user,
      accessToken,
      refreshToken: nextRefreshToken,
    } = await authService.refreshSession(refreshToken);
    res.cookie('refreshToken', nextRefreshToken, buildRefreshCookieOptions());

    sendSuccess(res, { message: 'Session refreshed', data: { user, accessToken } });
  } catch (error) {
    next(error);
  }
};

const logout = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const extraction = extractRefreshToken(req);
    if (extraction.error) {
      return sendError(res, { statusCode: 400, message: extraction.error });
    }
    const { token: refreshToken } = extraction;
    if (refreshToken) {
      try {
        const decoded = verifyRefreshToken(refreshToken);
        await authService.logout(decoded.id);
      } catch {
        // ignore invalid tokens on logout
      }
    }

    res.clearCookie('refreshToken', {
      path: '/api/auth',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
    sendSuccess(res, { message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

export { register, login, getProfile, updateProfile, refresh, logout };
