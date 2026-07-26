import logger from '../utils/logger';

const REQUIRED_ENV_VARS = ['MONGODB_URI', 'JWT_SECRET'];

export const validateEnv = (): void => {
  if (process.env.NODE_ENV === 'test') return;

  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    const error = new Error(`Missing required environment variables: ${missing.join(', ')}`);
    (error as Error & { statusCode?: number }).statusCode = 500;
    throw error;
  }

  if (process.env.PORT && Number.isNaN(Number(process.env.PORT))) {
    const error = new Error('PORT must be a number');
    (error as Error & { statusCode?: number }).statusCode = 500;
    throw error;
  }

  const allowedEnvs = ['development', 'test', 'production'];
  if (process.env.NODE_ENV && !allowedEnvs.includes(process.env.NODE_ENV)) {
    logger.warn(`NODE_ENV="${process.env.NODE_ENV}" is not one of ${allowedEnvs.join(', ')}`);
  }

  if (process.env.NODE_ENV === 'production' && (process.env.JWT_SECRET || '').length < 32) {
    logger.warn('JWT_SECRET is shorter than 32 characters; use a stronger secret in production.');
  }

  if (!process.env.OPENAI_API_KEY) {
    logger.warn('OPENAI_API_KEY not set — AI features will use built-in fallback responses.');
  }
};

export { REQUIRED_ENV_VARS };
