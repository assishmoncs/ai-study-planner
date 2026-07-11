const crypto = require('crypto');
const pinoHttp = require('pino-http');
const logger = require('../utils/logger');

// HTTP request logger with per-request correlation ids.
const requestLogger = pinoHttp({
  logger,
  genReqId: (req, res) => {
    const existing = req.headers['x-request-id'];
    const id = existing || crypto.randomUUID();
    res.setHeader('X-Request-Id', id);
    return id;
  },
  customLogLevel: (_req, res, err) => {
    if (err || res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  autoLogging: {
    ignore: (req) => req.url === '/api/health' || req.url === '/api/ready',
  },
});

module.exports = requestLogger;
