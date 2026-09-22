const express = require('express');
const router = express.Router();
const quotationController = require('../controllers/quotation.controller');
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');

// Supplier view of their own submitted quotations
router.get('/my', requireAuth, requireRole('SUPPLIER'), quotationController.getMyQuotations);

module.exports = router;
