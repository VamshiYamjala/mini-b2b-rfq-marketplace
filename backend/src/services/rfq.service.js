const RfqModel = require('../models/rfq.model');

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
  }
};

module.exports = RfqService;
