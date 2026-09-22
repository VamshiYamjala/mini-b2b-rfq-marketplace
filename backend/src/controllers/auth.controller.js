const AuthService = require('../services/auth.service');
const { ok } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const register = asyncHandler(async (req, res) => {
  const user = await AuthService.register(req.body);

  // Regenerate session to prevent session fixation and establish login state
  req.session.regenerate((err) => {
    if (err) {
      console.error('[AUTH] Session regeneration error on register:', err);
      return res.status(500).json({ success: false, message: 'Failed to initialize session', errors: [] });
    }

    req.session.userId = user.id;
    req.session.role = user.role;

    return ok(res, user, 'Registration successful', 201);
  });
});

const login = asyncHandler(async (req, res) => {
  const user = await AuthService.login(req.body);

  // Regenerate session on login to prevent session fixation attacks
  req.session.regenerate((err) => {
    if (err) {
      console.error('[AUTH] Session regeneration error on login:', err);
      return res.status(500).json({ success: false, message: 'Failed to regenerate session', errors: [] });
    }

    req.session.userId = user.id;
    req.session.role = user.role;

    return ok(res, user, 'Login successful', 200);
  });
});

const logout = asyncHandler(async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('[AUTH] Session destroy error on logout:', err);
      return res.status(500).json({ success: false, message: 'Could not log out, please try again', errors: [] });
    }

    res.clearCookie('marketplace_sid');
    return ok(res, {}, 'Logged out successfully', 200);
  });
});

const me = asyncHandler(async (req, res) => {
  return ok(res, req.user, 'Current user retrieved', 200);
});

module.exports = {
  register,
  login,
  logout,
  me
};
