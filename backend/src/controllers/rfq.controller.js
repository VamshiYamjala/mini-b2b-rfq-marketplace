const RfqService = require('../services/rfq.service');
const { ok } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const createRfq = asyncHandler(async (req, res) => {
  const rfq = await RfqService.createRfq(req.user.id, req.body);
  return ok(res, rfq, 'RFQ created successfully', 201);
});

const getMyRfqs = asyncHandler(async (req, res) => {
  const rfqs = await RfqService.getMyRfqs(req.user.id, req.query.status);
  return ok(res, rfqs, 'My RFQs retrieved successfully', 200);
});

const getRfqById = asyncHandler(async (req, res) => {
  const rfq = await RfqService.getRfqById(req.params.id, req.user);
  return ok(res, rfq, 'RFQ details retrieved successfully', 200);
});

const updateRfq = asyncHandler(async (req, res) => {
  const rfq = await RfqService.updateRfq(req.params.id, req.user.id, req.body);
  return ok(res, rfq, 'RFQ updated successfully', 200);
});

const closeRfq = asyncHandler(async (req, res) => {
  const rfq = await RfqService.closeRfq(req.params.id, req.user.id);
  return ok(res, rfq, 'RFQ closed successfully', 200);
});

module.exports = {
  createRfq,
  getMyRfqs,
  getRfqById,
  updateRfq,
  closeRfq
};
