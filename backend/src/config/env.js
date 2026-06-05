const REQUIRED_ENV_VARS = ['MONGODB_URI', 'JWT_SECRET'];

const validateEnv = () => {
  if (process.env.NODE_ENV === 'test') return;

  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    const error = new Error(`Missing required environment variables: ${missing.join(', ')}`);
    error.statusCode = 500;
    throw error;
  }
};

module.exports = { validateEnv };
