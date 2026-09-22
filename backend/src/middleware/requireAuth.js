const { UnauthorizedError } = require('../utils/errors');
const UserModel = require('../models/user.model');

const requireAuth = async (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return next(new UnauthorizedError('Authentication required. Please log in.'));
  }

  try {
    const user = await UserModel.findById(req.session.userId);
    if (!user) {
      // Session exists for deleted/non-existent user
      req.session.destroy(() => {});
      return next(new UnauthorizedError('Session invalid. User no longer exists.'));
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = requireAuth;
