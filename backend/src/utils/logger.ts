import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

const logger = pino({
  level: process.env.LOG_LEVEL || (isProduction ? 'info' : isTest ? 'silent' : 'debug'),
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'res.headers["set-cookie"]',
      '*.password',
      '*.token',
      '*.accessToken',
      '*.refreshToken',
    ],
    censor: '[redacted]',
  },
  transport:
    !isProduction && !isTest
      ? {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'SYS:standard', ignore: 'pid,hostname' },
        }
      : undefined,
});

export default logger;
