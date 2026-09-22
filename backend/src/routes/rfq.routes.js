const express = require('express');
const router = express.Router();
const rfqController = require('../controllers/rfq.controller');
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');
const { validateRfq } = require('../validators/rfq.validator');

// Buyer RFQ Creation - Level 5
router.post('/', requireAuth, requireRole('BUYER'), validateRfq, rfqController.createRfq);

module.exports = router;
