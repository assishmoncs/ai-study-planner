import User from '../models/User';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
} from '../utils/jwtUtils';
import type { RegisterPayload, LoginPayload, ProfileUpdatePayload, IUser } from '../types/index';

const register = async ({ name, email, password }: RegisterPayload) => {
  const existing = await User.findOne({ email: String(email) });
  if (existing) {
    const error = new Error('Email is already registered') as Error & { statusCode: number };
    error.statusCode = 409;
    throw error;
  }

  const user = await User.create({ name, email, password });
  const accessToken = signAccessToken(user._id.toString());
  const refreshToken = signRefreshToken(user._id.toString());

  user.refreshToken = hashToken(refreshToken);
  await user.save();

  return { user, accessToken, refreshToken };
};

const login = async ({ email, password }: LoginPayload) => {
  const user = await User.findOne({ email: String(email) }).select('+password +refreshToken');
  if (!user || !(await user.comparePassword(password))) {
    const error = new Error('Invalid email or password') as Error & { statusCode: number };
    error.statusCode = 401;
    throw error;
  }

  const accessToken = signAccessToken(user._id.toString());
  const refreshToken = signRefreshToken(user._id.toString());
  user.refreshToken = hashToken(refreshToken);
  await user.save();

  return { user, accessToken, refreshToken };
};

const getProfile = async (userId: string): Promise<IUser> => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found') as Error & { statusCode: number };
    error.statusCode = 404;
    throw error;
  }
  return user;
};

const updateProfile = async (userId: string, updates: ProfileUpdatePayload): Promise<IUser> => {
  const allowedFields = ['name', 'avatar', 'preferences'] as const;
  const filtered = Object.keys(updates)
    .filter((key): key is typeof allowedFields[number] => allowedFields.includes(key as typeof allowedFields[number]))
    .reduce<Record<string, unknown>>((obj, key) => {
      obj[key] = updates[key];
      return obj;
    }, {});

  const user = await User.findByIdAndUpdate(userId, filtered, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    const error = new Error('User not found') as Error & { statusCode: number };
    error.statusCode = 404;
    throw error;
  }
  return user;
};

const refreshSession = async (refreshToken: string) => {
  const decoded = verifyRefreshToken(refreshToken);
  const user = await User.findById(decoded.id).select('+refreshToken');

  if (!user || !user.refreshToken || user.refreshToken !== hashToken(refreshToken)) {
    const error = new Error('Refresh token is invalid or expired') as Error & { statusCode: number };
    error.statusCode = 401;
    throw error;
  }

  const accessToken = signAccessToken(user._id.toString());
  const nextRefreshToken = signRefreshToken(user._id.toString());
  user.refreshToken = hashToken(nextRefreshToken);
  await user.save();

  return { user, accessToken, refreshToken: nextRefreshToken };
};

const logout = async (userId: string | undefined): Promise<void> => {
  if (!userId) return;
  await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } }, { runValidators: false });
};

export { register, login, getProfile, updateProfile, refreshSession, logout };
