import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import type { AuthPayload } from '../types/index';

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not configured');
  }
  return secret;
};

const getAccessExpiresIn = (): string => process.env.JWT_EXPIRES_IN || '15m';
const getRefreshExpiresIn = (): string => process.env.JWT_REFRESH_EXPIRES_IN || '30d';

/**
 * Signs a short-lived JWT access token for the specified user ID.
 *
 * @param userId - MongoDB ObjectId string of the authenticated user
 * @returns Signed JWT access token
 */
export const signAccessToken = (userId: string): string => {
  return jwt.sign({ id: userId, type: 'access' } as AuthPayload, getJwtSecret(), {
    expiresIn: getAccessExpiresIn() as jwt.SignOptions['expiresIn'],
  });
};

/**
 * Signs a long-lived JWT refresh token with a unique token identifier (`jti`).
 *
 * @param userId - MongoDB ObjectId string of the authenticated user
 * @returns Signed JWT refresh token
 */
export const signRefreshToken = (userId: string): string => {
  return jwt.sign(
    { id: userId, type: 'refresh', jti: crypto.randomUUID() } as AuthPayload,
    getJwtSecret(),
    { expiresIn: getRefreshExpiresIn() as jwt.SignOptions['expiresIn'] }
  );
};

/**
 * Verifies a JWT signature and returns its decoded payload.
 *
 * @param token - Raw JWT string
 * @returns Decoded authentication payload
 */
export const verifyToken = (token: string): AuthPayload => {
  return jwt.verify(token, getJwtSecret()) as AuthPayload;
};

/**
 * Verifies a JWT and asserts that it is an access token.
 *
 * @param token - Raw JWT access token
 * @returns Decoded access token payload
 */
export const verifyAccessToken = (token: string): AuthPayload => {
  const decoded = verifyToken(token);
  if (decoded.type && decoded.type !== 'access') {
    throw new jwt.JsonWebTokenError('Invalid access token');
  }
  return decoded;
};

/**
 * Verifies a JWT and asserts that it is a refresh token.
 *
 * @param token - Raw JWT refresh token
 * @returns Decoded refresh token payload
 */
export const verifyRefreshToken = (token: string): AuthPayload => {
  const decoded = verifyToken(token);
  if (decoded.type !== 'refresh') {
    throw new jwt.JsonWebTokenError('Invalid refresh token');
  }
  return decoded;
};

/**
 * Computes a deterministic SHA-256 hex digest of a token for secure database storage.
 *
 * @param token - Raw token string
 * @returns SHA-256 hex digest
 */
export const hashToken = (token: string): string =>
  crypto.createHash('sha256').update(token).digest('hex');

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

/**
 * Builds secure HttpOnly cookie options for storing the refresh token.
 */
export const buildRefreshCookieOptions = () => ({
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/api/auth',
  maxAge: parseDurationToMs(getRefreshExpiresIn()),
});
