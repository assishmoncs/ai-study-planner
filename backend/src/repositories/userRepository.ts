import User from '../models/User';
import type { IUser, RegisterPayload } from '../types/index';

export const findByEmail = async (email: string): Promise<IUser | null> => User.findOne({ email });

// Credentials are excluded by default on the model; only auth flows select them.
export const findByEmailWithCredentials = async (email: string): Promise<IUser | null> =>
  User.findOne({ email }).select('+password +refreshToken');

export const createUser = async (data: RegisterPayload): Promise<IUser> => User.create(data);

export const findById = async (id: string): Promise<IUser | null> => User.findById(id);

export const findByIdWithRefreshToken = async (id: string): Promise<IUser | null> =>
  User.findById(id).select('+refreshToken');

export const updateById = async (
  id: string,
  updates: Record<string, unknown>
): Promise<IUser | null> =>
  User.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true });

export const clearRefreshToken = async (id: string): Promise<void> => {
  await User.findByIdAndUpdate(id, { $unset: { refreshToken: 1 } });
};
