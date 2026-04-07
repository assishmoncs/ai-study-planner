const User = require('../models/User');
const { signAccessToken } = require('../utils/jwtUtils');

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
  const token = signAccessToken(user._id);

  return { user, token };
};

/**
 * Authenticate an existing user.
 */
const login = async ({ email, password }) => {
  const user = await User.findOne({ email: String(email) }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const token = signAccessToken(user._id);
  return { user, token };
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

module.exports = { register, login, getProfile, updateProfile };
