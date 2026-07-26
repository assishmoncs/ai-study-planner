import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import type { AuthPayload } from '../types/index';

const ACCESS_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

export const signAccessToken = (userId: string): string => {
  return jwt.sign({ id: userId, type: 'access' } as AuthPayload, process.env.JWT_SECRET!, {
    expiresIn: ACCESS_EXPIRES_IN as any,
  });
};

export const signRefreshToken = (userId: string): string => {
  return jwt.sign(
    { id: userId, type: 'refresh', jti: crypto.randomUUID() } as AuthPayload,
    process.env.JWT_SECRET!,
    { expiresIn: REFRESH_EXPIRES_IN as any }
  );
};

export const verifyToken = (token: string): AuthPayload => {
  return jwt.verify(token, process.env.JWT_SECRET!) as AuthPayload;
};

export const verifyAccessToken = (token: string): AuthPayload => {
  const decoded = verifyToken(token);
  if (decoded.type && decoded.type !== 'access') {
    throw new jwt.JsonWebTokenError('Invalid access token');
  }
  return decoded;
};

export const verifyRefreshToken = (token: string): AuthPayload => {
  const decoded = verifyToken(token);
  if (decoded.type !== 'refresh') {
    throw new jwt.JsonWebTokenError('Invalid refresh token');
  }
  return decoded;
};

export const hashToken = (token: string): string =>
  crypto.createHash('sha256').update(token).digest('hex');

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/api/auth',
};

const parseDurationToMs = (duration: string | number): number => {
  if (typeof duration === 'number') return duration;
  const match = String(duration)
    .trim()
    .match(/^(\d+)([smhd])$/i);
  if (!match) return 30 * 24 * 60 * 60 * 1000;
  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  const factors: Record<string, number> = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return amount * factors[unit];
};

export const buildRefreshCookieOptions = () => ({
  ...cookieOptions,
  maxAge: parseDurationToMs(REFRESH_EXPIRES_IN),
});
