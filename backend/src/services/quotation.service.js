const QuotationModel = require('../models/quotation.model');
const RfqModel = require('../models/rfq.model');
const { NotFoundError, ForbiddenError, ConflictError } = require('../utils/errors');

const QuotationService = {
  async submitQuotation(rfqId, supplierId, data) {
    // 1. Check RFQ exists
    const rfq = await RfqModel.findById(rfqId);
    if (!rfq) {
      throw new NotFoundError(`RFQ with ID ${rfqId} not found`);
    }

    // 2. Check RFQ status is OPEN
    if (rfq.status !== 'OPEN') {
      throw new ConflictError('Cannot submit quotation: this RFQ is closed');
    }

    // 3. Check live deadline
    if (new Date(rfq.deadline) <= new Date()) {
      throw new ConflictError('Cannot submit quotation: this RFQ deadline has expired');
    }

    // 4. Check for duplicate quotation from this supplier
    const existing = await QuotationModel.findByRfqAndSupplier(rfqId, supplierId);
    if (existing) {
      throw new ConflictError('You have already submitted a quotation for this RFQ');
    }

    // 5. Create quotation (database UNIQUE constraint serves as ultimate backstop)
    const quotation = await QuotationModel.create({
      rfqId,
      supplierId,
      quotedPrice: data.quoted_price,
      estimatedDeliveryTime: data.estimated_delivery_time,
      message: data.message
    });

    return quotation;
  },

  async getMyQuotations(supplierId) {
    return QuotationModel.findMyQuotations(supplierId);
  },

  async getRfqQuotations(rfqId, buyerId) {
    const rfq = await RfqModel.findById(rfqId);
    if (!rfq) {
      throw new NotFoundError(`RFQ with ID ${rfqId} not found`);
    }

    // Buyer ownership check
    if (rfq.buyer_id !== buyerId) {
      throw new ForbiddenError('Access forbidden: you can only view quotations for your own RFQs');
    }

    return QuotationModel.findByRfqId(rfqId);
  }
};

module.exports = QuotationService;
