// ============================================================
//  middleware/validate.js — Validation Error Handler
//  Checks result of express-validator rules on a route
//  If validation fails returns 400 with all error messages
//  If validation passes calls next() to reach the controller
// ============================================================

const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success : false,
      message : 'Validation failed',
      errors  : errors.array().map((err) => ({
        field   : err.path,
        message : err.msg,
      })),
    });
  }

  next();
};

module.exports = { validate };