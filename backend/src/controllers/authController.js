const { validationResult } = require('express-validator');
const authService = require('../services/authService');
const { sendSuccess, sendError } = require('../utils/responseHelper');

const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, { statusCode: 400, message: 'Validation failed', errors: errors.array() });
    }

    const { name, email, password } = req.body;
    const { user, token } = await authService.register({ name, email, password });

    sendSuccess(res, { statusCode: 201, message: 'Registration successful', data: { user, token } });
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
    const { user, token } = await authService.login({ email, password });

    sendSuccess(res, { message: 'Login successful', data: { user, token } });
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

module.exports = { register, login, getProfile, updateProfile };
