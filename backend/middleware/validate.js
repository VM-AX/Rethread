const { validationResult } = require('express-validator');
const { ApiError } = require('./errorHandler');

// Runs after an array of express-validator checks; collects errors into a
// single consistent 400 response instead of repeating this in every route.
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(
      400,
      'Validation failed',
      errors.array().map((e) => ({ field: e.path, message: e.msg }))
    );
  }
  next();
};

module.exports = validate;
