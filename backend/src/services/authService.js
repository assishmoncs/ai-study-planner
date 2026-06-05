const User = require('../models/User');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
} = require('../utils/jwtUtils');

/**
 * Register a new user.
 */
const register = async ({ name, email, password }) => {
  const existing = await User.findOne({ email: String(email) });
  if (existing) {
    const error = new Error('Email is already registered');
    error.statusCode = 409;
    throw error;
  }

  const user = await User.create({ name, email, password });
  const accessToken = signAccessToken(user._id);
  const refreshToken = signRefreshToken(user._id);

  user.refreshToken = hashToken(refreshToken);
  await user.save();

  return { user, accessToken, refreshToken };
};

/**
 * Authenticate an existing user.
 */
const login = async ({ email, password }) => {
  const user = await User.findOne({ email: String(email) }).select('+password +refreshToken');
  if (!user || !(await user.comparePassword(password))) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const accessToken = signAccessToken(user._id);
  const refreshToken = signRefreshToken(user._id);
  user.refreshToken = hashToken(refreshToken);
  await user.save();

  return { user, accessToken, refreshToken };
};

/**
 * Return the currently authenticated user's profile.
 */
const getProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  return user;
};

/**
 * Update user preferences / profile fields.
 */
const updateProfile = async (userId, updates) => {
  const allowedFields = ['name', 'avatar', 'preferences'];
  const filtered = Object.keys(updates)
    .filter((key) => allowedFields.includes(key))
    .reduce((obj, key) => {
      obj[key] = updates[key];
      return obj;
    }, {});

  const user = await User.findByIdAndUpdate(userId, filtered, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  return user;
};

const refreshSession = async (refreshToken) => {
  const decoded = verifyRefreshToken(refreshToken);
  const user = await User.findById(decoded.id).select('+refreshToken');

  if (!user || !user.refreshToken || user.refreshToken !== hashToken(refreshToken)) {
    const error = new Error('Refresh token is invalid or expired');
    error.statusCode = 401;
    throw error;
  }

  const accessToken = signAccessToken(user._id);
  const nextRefreshToken = signRefreshToken(user._id);
  user.refreshToken = hashToken(nextRefreshToken);
  await user.save();

  return { user, accessToken, refreshToken: nextRefreshToken };
};

const logout = async (userId) => {
  if (!userId) return;
  await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } }, { runValidators: false });
};

module.exports = { register, login, getProfile, updateProfile, refreshSession, logout };
