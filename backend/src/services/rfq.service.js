const RfqModel = require('../models/rfq.model');
const { NotFoundError, ForbiddenError, ConflictError } = require('../utils/errors');

const RfqService = {
  async createRfq(buyerId, data) {
    const rfq = await RfqModel.create({
      buyerId,
      productServiceName: data.product_service_name,
      requirementDescription: data.requirement_description,
      quantity: data.quantity,
      deliveryLocation: data.delivery_location,
      deadline: data.deadline
    });

    return rfq;
  },

  async getMyRfqs(buyerId, status) {
    return RfqModel.findMyRfqs(buyerId, status);
  },

  async getPublicRfqs(filters) {
    return RfqModel.findPublicRfqs(filters);
  },

  async getRfqById(id, user) {
    const rfq = await RfqModel.findById(id);
    if (!rfq) {
      throw new NotFoundError(`RFQ with ID ${id} not found`);
    }

    // Buyer ownership check per Section 9.3
    if (user.role === 'BUYER' && rfq.buyer_id !== user.id) {
      throw new ForbiddenError('Access forbidden: you do not own this RFQ');
    }

    // Attach live is_expired check
    const isExpired = new Date(rfq.deadline) <= new Date();
    return {
      ...rfq,
      is_expired: isExpired
    };
  },

  async updateRfq(id, buyerId, data) {
    const rfq = await RfqModel.findById(id);
    if (!rfq) {
      throw new NotFoundError(`RFQ with ID ${id} not found`);
    }

    // Ownership check
    if (rfq.buyer_id !== buyerId) {
      throw new ForbiddenError('Access forbidden: you cannot edit another buyer\'s RFQ');
    }

    // Edit only while OPEN check (§10.2)
    if (rfq.status !== 'OPEN') {
      throw new ConflictError('Cannot edit an RFQ that is already closed');
    }

    const updated = await RfqModel.update(id, buyerId, {
      productServiceName: data.product_service_name,
      requirementDescription: data.requirement_description,
      quantity: data.quantity,
      deliveryLocation: data.delivery_location,
      deadline: data.deadline
    });

    return updated;
  },

  async closeRfq(id, buyerId) {
    const rfq = await RfqModel.findById(id);
    if (!rfq) {
      throw new NotFoundError(`RFQ with ID ${id} not found`);
    }

    // Ownership check
    if (rfq.buyer_id !== buyerId) {
      throw new ForbiddenError('Access forbidden: you cannot close another buyer\'s RFQ');
    }

    // Double close check (§10.3)
    if (rfq.status === 'CLOSED') {
      throw new ConflictError('RFQ is already closed');
    }

    const closed = await RfqModel.close(id, buyerId);
    return closed;
  }
};

module.exports = RfqService;
