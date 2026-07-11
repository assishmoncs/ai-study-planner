const logger = require('../utils/logger');

const REQUIRED_ENV_VARS = ['MONGODB_URI', 'JWT_SECRET'];

const validateEnv = () => {
  if (process.env.NODE_ENV === 'test') return;

  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    const error = new Error(`Missing required environment variables: ${missing.join(', ')}`);
    error.statusCode = 500;
    throw error;
  }

  // Type / value sanity checks that would otherwise fail confusingly at runtime.
  if (process.env.PORT && Number.isNaN(Number(process.env.PORT))) {
    const error = new Error('PORT must be a number');
    error.statusCode = 500;
    throw error;
  }

  const allowedEnvs = ['development', 'test', 'production'];
  if (process.env.NODE_ENV && !allowedEnvs.includes(process.env.NODE_ENV)) {
    logger.warn(`NODE_ENV="${process.env.NODE_ENV}" is not one of ${allowedEnvs.join(', ')}`);
  }

  if (process.env.NODE_ENV === 'production' && (process.env.JWT_SECRET || '').length < 32) {
    logger.warn('JWT_SECRET is shorter than 32 characters; use a stronger secret in production.');
  }

  // Non-fatal: AI features gracefully fall back when the key is absent.
  if (!process.env.OPENAI_API_KEY) {
    logger.warn('OPENAI_API_KEY not set — AI features will use built-in fallback responses.');
  }
};

module.exports = { validateEnv, REQUIRED_ENV_VARS };
