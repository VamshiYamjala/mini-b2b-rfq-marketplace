const { ValidationError, BadRequestError } = require('../utils/errors');

const validateRfq = (req, res, next) => {
  const allowedFields = [
    'product_service_name',
    'requirement_description',
    'quantity',
    'delivery_location',
    'deadline'
  ];

  const bodyKeys = Object.keys(req.body);
  const unknownFields = bodyKeys.filter(key => !allowedFields.includes(key));

  if (unknownFields.length > 0) {
    return next(new BadRequestError(`Unexpected fields: ${unknownFields.join(', ')}`));
  }

  const errors = [];
  let {
    product_service_name,
    requirement_description,
    quantity,
    delivery_location,
    deadline
  } = req.body;

  // product_service_name: required, 3-150 chars
  if (typeof product_service_name !== 'string' || product_service_name.trim().length === 0) {
    errors.push({ field: 'product_service_name', message: 'Product/service name is required' });
  } else {
    product_service_name = product_service_name.trim();
    if (product_service_name.length < 3 || product_service_name.length > 150) {
      errors.push({
        field: 'product_service_name',
        message: 'Product/service name must be between 3 and 150 characters'
      });
    }
  }

  // requirement_description: required, 10-2000 chars
  if (typeof requirement_description !== 'string' || requirement_description.trim().length === 0) {
    errors.push({ field: 'requirement_description', message: 'Requirement description is required' });
  } else {
    requirement_description = requirement_description.trim();
    if (requirement_description.length < 10 || requirement_description.length > 2000) {
      errors.push({
        field: 'requirement_description',
        message: 'Requirement description must be between 10 and 2000 characters'
      });
    }
  }

  // quantity: required, integer > 0
  const parsedQuantity = Number(quantity);
  if (
    quantity === undefined ||
    quantity === null ||
    quantity === '' ||
    !Number.isInteger(parsedQuantity) ||
    parsedQuantity <= 0
  ) {
    errors.push({ field: 'quantity', message: 'Quantity must be a positive integer greater than zero' });
  }

  // delivery_location: required, 2-150 chars
  if (typeof delivery_location !== 'string' || delivery_location.trim().length === 0) {
    errors.push({ field: 'delivery_location', message: 'Delivery location is required' });
  } else {
    delivery_location = delivery_location.trim();
    if (delivery_location.length < 2 || delivery_location.length > 150) {
      errors.push({
        field: 'delivery_location',
        message: 'Delivery location must be between 2 and 150 characters'
      });
    }
  }

  // deadline: required, valid ISO date, strictly in the future
  if (!deadline || typeof deadline !== 'string' || deadline.trim().length === 0) {
    errors.push({ field: 'deadline', message: 'Deadline is required' });
  } else {
    const deadlineDate = new Date(deadline.trim());
    if (isNaN(deadlineDate.getTime())) {
      errors.push({ field: 'deadline', message: 'Deadline must be a valid date/time format' });
    } else if (deadlineDate <= new Date()) {
      errors.push({ field: 'deadline', message: 'Deadline must be strictly in the future' });
    }
  }

  if (errors.length > 0) {
    return next(new ValidationError('RFQ validation failed', errors));
  }

  // Sanitize sanitized body values
  req.body.product_service_name = product_service_name;
  req.body.requirement_description = requirement_description;
  req.body.quantity = parsedQuantity;
  req.body.delivery_location = delivery_location;
  req.body.deadline = new Date(deadline.trim()).toISOString().slice(0, 19).replace('T', ' ');

  next();
};

module.exports = {
  validateRfq
};
