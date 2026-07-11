const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const ACCESS_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

/**
 * Sign a JWT access token.
 * @param {string} userId
 * @returns {string}
 */
const signAccessToken = (userId) => {
  return jwt.sign({ id: userId, type: 'access' }, process.env.JWT_SECRET, {
    expiresIn: ACCESS_EXPIRES_IN,
  });
};

const signRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId, type: 'refresh', jti: crypto.randomUUID() },
    process.env.JWT_SECRET,
    {
      expiresIn: REFRESH_EXPIRES_IN,
    }
  );
};

/**
 * Verify a JWT token.
 * @param {string} token
 * @returns {object} decoded payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

const verifyAccessToken = (token) => {
  const decoded = verifyToken(token);
  if (decoded.type && decoded.type !== 'access') {
    throw new jwt.JsonWebTokenError('Invalid access token');
  }
  return decoded;
};

const verifyRefreshToken = (token) => {
  const decoded = verifyToken(token);
  if (decoded.type !== 'refresh') {
    throw new jwt.JsonWebTokenError('Invalid refresh token');
  }
  return decoded;
};

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/api/auth',
};

const parseDurationToMs = (duration) => {
  if (typeof duration === 'number') return duration;
  const match = String(duration)
    .trim()
    .match(/^(\d+)([smhd])$/i);
  if (!match) return 30 * 24 * 60 * 60 * 1000;
  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  const factors = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return amount * factors[unit];
};

const buildRefreshCookieOptions = () => ({
  ...cookieOptions,
  maxAge: parseDurationToMs(REFRESH_EXPIRES_IN),
});

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
  buildRefreshCookieOptions,
};
