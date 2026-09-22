const { ValidationError, BadRequestError } = require('../utils/errors');

const validateQuotation = (req, res, next) => {
  const allowedFields = ['quoted_price', 'estimated_delivery_time', 'message'];
  const bodyKeys = Object.keys(req.body);
  const unknownFields = bodyKeys.filter(key => !allowedFields.includes(key));

  if (unknownFields.length > 0) {
    return next(new BadRequestError(`Unexpected fields: ${unknownFields.join(', ')}`));
  }

  const errors = [];
  let { quoted_price, estimated_delivery_time, message } = req.body;

  // quoted_price: required, number, > 0, <= 100,000,000
  const parsedPrice = Number(quoted_price);
  if (
    quoted_price === undefined ||
    quoted_price === null ||
    quoted_price === '' ||
    isNaN(parsedPrice) ||
    parsedPrice <= 0
  ) {
    errors.push({ field: 'quoted_price', message: 'Quoted price must be a positive number greater than zero' });
  } else if (parsedPrice > 100000000) {
    errors.push({ field: 'quoted_price', message: 'Quoted price cannot exceed 100,000,000' });
  }

  // estimated_delivery_time: required, 2-60 chars
  if (typeof estimated_delivery_time !== 'string' || estimated_delivery_time.trim().length === 0) {
    errors.push({ field: 'estimated_delivery_time', message: 'Estimated delivery time is required' });
  } else {
    estimated_delivery_time = estimated_delivery_time.trim();
    if (estimated_delivery_time.length < 2 || estimated_delivery_time.length > 60) {
      errors.push({
        field: 'estimated_delivery_time',
        message: 'Estimated delivery time must be between 2 and 60 characters'
      });
    }
  }

  // message: optional, <= 1000 chars
  if (message !== undefined && message !== null) {
    if (typeof message !== 'string') {
      errors.push({ field: 'message', message: 'Message must be text' });
    } else {
      message = message.trim();
      if (message.length > 1000) {
        errors.push({ field: 'message', message: 'Message cannot exceed 1000 characters' });
      }
    }
  } else {
    message = null;
  }

  if (errors.length > 0) {
    return next(new ValidationError('Quotation validation failed', errors));
  }

  req.body.quoted_price = Number(parsedPrice.toFixed(2));
  req.body.estimated_delivery_time = estimated_delivery_time;
  req.body.message = message || null;

  next();
};

module.exports = {
  validateQuotation
};
