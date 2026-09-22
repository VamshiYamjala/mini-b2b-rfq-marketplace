/**
 * Standard API response envelope helpers
 * Conforms to Engineering Specification Section 11
 */

const ok = (res, data = {}, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

const fail = (res, message = 'An error occurred', errors = [], statusCode = 400) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors: Array.isArray(errors) ? errors : [{ message: String(errors) }]
  });
};

module.exports = {
  ok,
  fail
};
