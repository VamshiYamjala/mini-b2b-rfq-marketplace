const { ValidationError, BadRequestError } = require('../utils/errors');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

const validateRegister = (req, res, next) => {
  const allowedFields = ['name', 'email', 'password', 'role'];
  const bodyKeys = Object.keys(req.body);
  const unknownFields = bodyKeys.filter(key => !allowedFields.includes(key));

  if (unknownFields.length > 0) {
    return next(new BadRequestError(`Unexpected fields: ${unknownFields.join(', ')}`));
  }

  const errors = [];
  let { name, email, password, role } = req.body;

  // Name validation: 2-100 chars
  if (typeof name !== 'string' || name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Name is required' });
  } else {
    name = name.trim();
    if (name.length < 2 || name.length > 100) {
      errors.push({ field: 'name', message: 'Name must be between 2 and 100 characters' });
    }
  }

  // Email validation: valid email format
  if (typeof email !== 'string' || email.trim().length === 0) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else {
    email = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(email) || email.length > 190) {
      errors.push({ field: 'email', message: 'Please provide a valid email address' });
    }
  }

  // Password validation: >= 8 chars, >= 1 letter, >= 1 number
  if (typeof password !== 'string' || password.length === 0) {
    errors.push({ field: 'password', message: 'Password is required' });
  } else if (!PASSWORD_REGEX.test(password)) {
    errors.push({
      field: 'password',
      message: 'Password must be at least 8 characters long and contain at least one letter and one number'
    });
  }

  // Role validation: BUYER or SUPPLIER
  if (typeof role !== 'string' || !['BUYER', 'SUPPLIER'].includes(role.toUpperCase())) {
    errors.push({ field: 'role', message: 'Role must be either BUYER or SUPPLIER' });
  }

  if (errors.length > 0) {
    return next(new ValidationError('Registration validation failed', errors));
  }

  // Sanitize body
  req.body.name = name;
  req.body.email = email;
  req.body.role = role.toUpperCase();
  next();
};

const validateLogin = (req, res, next) => {
  const allowedFields = ['email', 'password'];
  const bodyKeys = Object.keys(req.body);
  const unknownFields = bodyKeys.filter(key => !allowedFields.includes(key));

  if (unknownFields.length > 0) {
    return next(new BadRequestError(`Unexpected fields: ${unknownFields.join(', ')}`));
  }

  const errors = [];
  const { email, password } = req.body;

  if (typeof email !== 'string' || email.trim().length === 0) {
    errors.push({ field: 'email', message: 'Email is required' });
  }

  if (typeof password !== 'string' || password.length === 0) {
    errors.push({ field: 'password', message: 'Password is required' });
  }

  if (errors.length > 0) {
    return next(new ValidationError('Login validation failed', errors));
  }

  req.body.email = email.trim().toLowerCase();
  next();
};

module.exports = {
  validateRegister,
  validateLogin
};
