const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validateRegister, validateLogin } = require('../validators/auth.validator');
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');
const { ok } = require('../utils/apiResponse');

router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/logout', requireAuth, authController.logout);
router.get('/me', requireAuth, authController.me);

// Role authorization probe routes (used for Level 4 verification & health probes)
router.get('/probe/buyer', requireAuth, requireRole('BUYER'), (req, res) => {
  return ok(res, { role: req.user.role, userId: req.user.id }, 'Buyer access granted');
});

router.get('/probe/supplier', requireAuth, requireRole('SUPPLIER'), (req, res) => {
  return ok(res, { role: req.user.role, userId: req.user.id }, 'Supplier access granted');
});

module.exports = router;
