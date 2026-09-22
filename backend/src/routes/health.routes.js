const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { ok, fail } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

router.get('/health', asyncHandler(async (req, res) => {
  try {
    await pool.query('SELECT 1');
    return ok(res, { status: 'ok', db: 'connected' }, 'Service healthy');
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Service unhealthy',
      data: { status: 'error', db: 'disconnected' }
    });
  }
}));

// Route to verify central error handling returns clean JSON 500
if (process.env.NODE_ENV !== 'production') {
  router.get('/health/error-test', asyncHandler(async (req, res) => {
    throw new Error('Test unhandled crash exception');
  }));
}

module.exports = router;
