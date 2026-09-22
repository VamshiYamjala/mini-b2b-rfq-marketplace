const { AppError } = require('../utils/errors');
const { fail } = require('../utils/apiResponse');

const errorHandler = (err, req, res, next) => {
  // Always log internal error details on server for debugging (without credentials)
  if (process.env.NODE_ENV !== 'test') {
    console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err.message || err);
    if (!err.statusCode || err.statusCode === 500) {
      console.error(err.stack);
    }
  }

  // Handle known application errors
  if (err instanceof AppError) {
    return fail(res, err.message, err.errors, err.statusCode);
  }

  // Handle MySQL duplicate entry error (e.g. unique constraints)
  if (err.code === 'ER_DUP_ENTRY') {
    if (err.message && err.message.includes('email')) {
      return fail(res, 'Email is already registered', [{ field: 'email', message: 'Email is already in use' }], 409);
    }
    if (err.message && err.message.includes('uq_rfq_supplier')) {
      return fail(res, 'You have already submitted a quotation for this RFQ', [], 409);
    }
    return fail(res, 'A duplicate record already exists', [], 409);
  }

  // Handle body-parser JSON parse error (malformed JSON)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return fail(res, 'Malformed JSON payload', [], 400);
  }

  // Unhandled / server errors -> safe generic 500 envelope with NO stack trace
  return fail(res, 'Internal server error', [], 500);
};

module.exports = errorHandler;
