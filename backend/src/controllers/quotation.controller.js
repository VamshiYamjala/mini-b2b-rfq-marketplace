const QuotationService = require('../services/quotation.service');
const { ok } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const submitQuotation = asyncHandler(async (req, res) => {
  const quotation = await QuotationService.submitQuotation(
    req.params.rfqId,
    req.user.id,
    req.body
  );
  return ok(res, quotation, 'Quotation submitted successfully', 201);
});

const getMyQuotations = asyncHandler(async (req, res) => {
  const quotations = await QuotationService.getMyQuotations(req.user.id);
  return ok(res, quotations, 'My quotations retrieved successfully', 200);
});

const getRfqQuotations = asyncHandler(async (req, res) => {
  const quotations = await QuotationService.getRfqQuotations(
    req.params.rfqId,
    req.user.id
  );
  return ok(res, quotations, 'RFQ quotations retrieved successfully', 200);
});

module.exports = {
  submitQuotation,
  getMyQuotations,
  getRfqQuotations
};
