const { sendError } = require('../utils/responseHelper');

// eslint-disable-next-line no-unused-vars is not needed – _next prefix signals intentionally unused
const errorHandler = (err, req, res, _next) => {
  console.error(err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    return sendError(res, { statusCode: 400, message: 'Validation failed', errors });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return sendError(res, { statusCode: 409, message: `A record with that ${field} already exists` });
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    return sendError(res, { statusCode: 400, message: 'Invalid resource ID' });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, { statusCode: 401, message: 'Invalid token' });
  }
  if (err.name === 'TokenExpiredError') {
    return sendError(res, { statusCode: 401, message: 'Token expired' });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  sendError(res, { statusCode, message });
};

module.exports = errorHandler;
