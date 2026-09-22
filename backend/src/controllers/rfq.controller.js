const RfqService = require('../services/rfq.service');
const { ok } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const createRfq = asyncHandler(async (req, res) => {
  const rfq = await RfqService.createRfq(req.user.id, req.body);
  return ok(res, rfq, 'RFQ created successfully', 201);
});

module.exports = {
  createRfq
};
