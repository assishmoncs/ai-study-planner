import * as userRepository from '../repositories/userRepository';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
} from '../utils/jwtUtils';
import AppError from '../utils/AppError';
import type { RegisterPayload, LoginPayload, ProfileUpdatePayload, IUser } from '../types/index';

/**
 * Registers a new user account, hashes the password via model hooks,
 * and issues an initial access + refresh token pair.
 */
const register = async ({ name, email, password }: RegisterPayload) => {
  const normalizedEmail = String(email).trim().toLowerCase();
  const existing = await userRepository.findByEmail(normalizedEmail);
  if (existing) {
    throw new AppError('Email is already registered', 409, { code: 'EMAIL_EXISTS' });
  }

  const user = await userRepository.createUser({
    name: String(name).trim(),
    email: normalizedEmail,
    password,
  });
  const accessToken = signAccessToken(user._id.toString());
  const refreshToken = signRefreshToken(user._id.toString());

  user.refreshToken = hashToken(refreshToken);
  await user.save();

  return { user, accessToken, refreshToken };
};

/**
 * Authenticates a user by email and password and rotates the refresh token.
 */
const login = async ({ email, password }: LoginPayload) => {
  const normalizedEmail = String(email).trim().toLowerCase();
  const user = await userRepository.findByEmailWithCredentials(normalizedEmail);
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401, { code: 'INVALID_CREDENTIALS' });
  }

  const accessToken = signAccessToken(user._id.toString());
  const refreshToken = signRefreshToken(user._id.toString());
  user.refreshToken = hashToken(refreshToken);
  await user.save();

  return { user, accessToken, refreshToken };
};

/**
 * Retrieves the profile of the authenticated user.
 */
const getProfile = async (userId: string): Promise<IUser> => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404, { code: 'USER_NOT_FOUND' });
  }
  return user;
};

/**
 * Updates allowed profile fields and study preferences for the authenticated user.
 */
const updateProfile = async (userId: string, updates: ProfileUpdatePayload): Promise<IUser> => {
  const allowedFields = ['name', 'avatar', 'preferences'] as const;
  const filtered = Object.keys(updates)
    .filter((key): key is (typeof allowedFields)[number] =>
      allowedFields.includes(key as (typeof allowedFields)[number])
    )
    .reduce<Record<string, unknown>>((obj, key) => {
      obj[key] = updates[key];
      return obj;
    }, {});

  const user = await userRepository.updateById(userId, filtered);
  if (!user) {
    throw new AppError('User not found', 404, { code: 'USER_NOT_FOUND' });
  }
  return user;
};

/**
 * Verifies a refresh token against the stored hash and issues a rotated token pair.
 */
const refreshSession = async (refreshToken: string) => {
  const decoded = verifyRefreshToken(refreshToken);
  const user = await userRepository.findByIdWithRefreshToken(decoded.id);

  if (!user || !user.refreshToken || user.refreshToken !== hashToken(refreshToken)) {
    throw new AppError('Refresh token is invalid or expired', 401, {
      code: 'INVALID_REFRESH_TOKEN',
    });
  }

  const accessToken = signAccessToken(user._id.toString());
  const nextRefreshToken = signRefreshToken(user._id.toString());
  user.refreshToken = hashToken(nextRefreshToken);
  await user.save();

  return { user, accessToken, refreshToken: nextRefreshToken };
};

/**
 * Invalidates the active refresh token for the specified user.
 */
const logout = async (userId: string | undefined): Promise<void> => {
  if (!userId) return;
  await userRepository.clearRefreshToken(userId);
};

export { register, login, getProfile, updateProfile, refreshSession, logout };
