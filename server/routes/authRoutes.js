// ============================================================
//  routes/authRoutes.js — Auth Routes
//  Base path: /api/v1/auth
// ============================================================

const express                        = require('express');
const { body }                       = require('express-validator');
const { register, login, logout }    = require('../controllers/authController');
const { validate }                   = require('../middleware/validate');
const { protect }                    = require('../middleware/authMiddleware');

const router = express.Router();

// ─── POST /api/v1/auth/register ──────────────────────────────
router.post(
  '/register',
  [
    body('name')
      .trim()
      .notEmpty().withMessage('Name is required'),

    body('email')
      .trim()
      .isEmail().withMessage('Please provide a valid email')
      .normalizeEmail(),

    body('password')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
      .matches(/\d/).withMessage('Password must contain at least one number'),
  ],
  validate,
  register
);

// ─── POST /api/v1/auth/login ──────────────────────────────────
router.post(
  '/login',
  [
    body('email')
      .trim()
      .isEmail().withMessage('Please provide a valid email')
      .normalizeEmail(),

    body('password')
      .notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

// ─── POST /api/v1/auth/logout ─────────────────────────────────
router.post('/logout', protect, logout);

module.exports = router;