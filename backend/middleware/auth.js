const jwt = require('jsonwebtoken');
const asyncHandler = require('./asyncHandler');
const { ApiError } = require('./errorHandler');
const User = require('../models/User');

// Verifies the JWT and attaches the authenticated (and safe) user to req.user
const protect = asyncHandler(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Not authorized — no token provided');
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);

  if (!user || user.isDeleted) {
    throw new ApiError(401, 'Not authorized — user no longer exists');
  }
  if (user.isBlocked) {
    throw new ApiError(403, 'Your account has been blocked. Contact support.');
  }

  req.user = user;
  next();
});

// Role-based authorization guard: authorize('seller', 'admin')
const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    throw new ApiError(403, `Role '${req.user ? req.user.role : 'guest'}' is not permitted to perform this action`);
  }
  next();
};

module.exports = { protect, authorize };
