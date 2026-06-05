const { validationResult } = require('express-validator');
const authService = require('../services/authService');
const { sendSuccess, sendError } = require('../utils/responseHelper');
const { buildRefreshCookieOptions, verifyRefreshToken } = require('../utils/jwtUtils');

const extractRefreshToken = (req) => {
  try {
    const cookieHeader = req.headers.cookie || '';
    const cookies = cookieHeader.split(';').reduce((acc, pair) => {
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

const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, { statusCode: 400, message: 'Validation failed', errors: errors.array() });
    }

    const { name, email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.register({ name, email, password });
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

const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, { statusCode: 400, message: 'Validation failed', errors: errors.array() });
    }

    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.login({ email, password });
    res.cookie('refreshToken', refreshToken, buildRefreshCookieOptions());

    sendSuccess(res, { message: 'Login successful', data: { user, accessToken } });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await authService.getProfile(req.user._id);
    sendSuccess(res, { data: { user } });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const user = await authService.updateProfile(req.user._id, req.body);
    sendSuccess(res, { message: 'Profile updated', data: { user } });
  } catch (error) {
    next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const extraction = extractRefreshToken(req);
    if (extraction.error) {
      return sendError(res, { statusCode: 400, message: extraction.error });
    }
    const { token: refreshToken } = extraction;
    if (!refreshToken) {
      return sendError(res, { statusCode: 401, message: 'Refresh token is required' });
    }

    const { user, accessToken, refreshToken: nextRefreshToken } = await authService.refreshSession(refreshToken);
    res.cookie('refreshToken', nextRefreshToken, buildRefreshCookieOptions());

    sendSuccess(res, { message: 'Session refreshed', data: { user, accessToken } });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
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

module.exports = { register, login, getProfile, updateProfile, refresh, logout };
