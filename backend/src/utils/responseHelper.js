/**
 * Send a standardised success response.
 */
const sendSuccess = (res, { statusCode = 200, message = 'Success', data = null } = {}) => {
  const body = { success: true, message };
  if (data !== null) body.data = data;
  return res.status(statusCode).json(body);
};

/**
 * Send a standardised error response.
 */
const sendError = (res, { statusCode = 500, message = 'Internal server error', errors = null } = {}) => {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  return res.status(statusCode).json(body);
};

module.exports = { sendSuccess, sendError };
