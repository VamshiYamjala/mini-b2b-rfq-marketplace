const { ForbiddenError } = require('../utils/errors');

/**
 * Middleware factory for role-based authorization
 * Enforces permissions per Engineering Specification Section 9.2
 * Must be used AFTER requireAuth middleware
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return next(new ForbiddenError('Access forbidden: user role not identified'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Access forbidden: requires ${allowedRoles.join(' or ')} role, but current role is ${req.user.role}`
        )
      );
    }

    next();
  };
};

module.exports = requireRole;
