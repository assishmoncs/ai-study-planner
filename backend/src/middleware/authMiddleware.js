const { verifyAccessToken } = require('../utils/jwtUtils');
const User = require('../models/User');
const { sendError } = require('../utils/responseHelper');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return sendError(res, { statusCode: 401, message: 'Not authorized – no token provided' });
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = await User.findById(decoded.id).select('-password -refreshToken');

    if (!req.user) {
      return sendError(res, {
        statusCode: 401,
        message: 'User belonging to this token no longer exists',
      });
    }

    next();
  } catch (error) {
    return sendError(res, { statusCode: 401, message: 'Not authorized – invalid token' });
  }
};

module.exports = { protect };
