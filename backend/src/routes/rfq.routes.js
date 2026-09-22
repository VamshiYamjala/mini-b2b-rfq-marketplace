const express = require('express');
const router = express.Router();
const rfqController = require('../controllers/rfq.controller');
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');
const { validateRfq } = require('../validators/rfq.validator');

// Buyer RFQ Creation - Level 5
router.post('/', requireAuth, requireRole('BUYER'), validateRfq, rfqController.createRfq);

// Buyer RFQ Management - Level 6
// Note: /my MUST be registered before /:id to avoid route collision
router.get('/my', requireAuth, requireRole('BUYER'), rfqController.getMyRfqs);
router.get('/:id', requireAuth, rfqController.getRfqById);
router.put('/:id', requireAuth, requireRole('BUYER'), validateRfq, rfqController.updateRfq);
router.patch('/:id/close', requireAuth, requireRole('BUYER'), rfqController.closeRfq);

module.exports = router;
