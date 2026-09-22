const express = require('express');
const router = express.Router();
const rfqController = require('../controllers/rfq.controller');
const quotationController = require('../controllers/quotation.controller');
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');
const { validateRfq } = require('../validators/rfq.validator');
const { validateQuotation } = require('../validators/quotation.validator');

// Buyer RFQ Creation - Level 5
router.post('/', requireAuth, requireRole('BUYER'), validateRfq, rfqController.createRfq);

// Supplier RFQ Discovery - Level 7
router.get('/', requireAuth, requireRole('SUPPLIER'), rfqController.getPublicRfqs);

// Buyer RFQ Management - Level 6
// Note: /my MUST be registered before /:id to avoid collision
router.get('/my', requireAuth, requireRole('BUYER'), rfqController.getMyRfqs);
router.get('/:id', requireAuth, rfqController.getRfqById);
router.put('/:id', requireAuth, requireRole('BUYER'), validateRfq, rfqController.updateRfq);
router.patch('/:id/close', requireAuth, requireRole('BUYER'), rfqController.closeRfq);

// Quotation Endpoints - Level 8
router.post(
  '/:rfqId/quotations',
  requireAuth,
  requireRole('SUPPLIER'),
  validateQuotation,
  quotationController.submitQuotation
);

router.get(
  '/:rfqId/quotations',
  requireAuth,
  requireRole('BUYER'),
  quotationController.getRfqQuotations
);

module.exports = router;
