// ============================================================
//  routes/taskRoutes.js — Task Routes
//  Base path: /api/v1/tasks
//  All routes are protected — JWT token required
// ============================================================

const express                                                          = require('express');
const { body, query }                                                  = require('express-validator');
const { createTask, getAllTasks, getTaskById, updateTask, deleteTask } = require('../controllers/taskController');
const { protect }                                                      = require('../middleware/authMiddleware');
const { validate }                                                     = require('../middleware/validate');

const router = express.Router();

// Apply protect middleware to ALL routes in this file
router.use(protect);

// ─── POST   /api/v1/tasks ─────────────────────────────────────
router.post(
  '/',
  [
    body('title')
      .trim()
      .notEmpty().withMessage('Task title is required')
      .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),

    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),

    body('status')
      .optional()
      .isIn(['pending', 'in-progress', 'completed'])
      .withMessage('Status must be pending, in-progress or completed'),
  ],
  validate,
  createTask
);

// ─── GET    /api/v1/tasks ─────────────────────────────────────
router.get(
  '/',
  [
    query('page')
      .optional()
      .isInt({ min: 1 }).withMessage('Page must be a positive number'),

    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),

    query('status')
      .optional()
      .isIn(['pending', 'in-progress', 'completed'])
      .withMessage('Status must be pending, in-progress or completed'),

    query('search')
      .optional()
      .trim()
      .isLength({ max: 100 }).withMessage('Search query too long'),
  ],
  validate,
  getAllTasks
);

// ─── GET    /api/v1/tasks/:id ─────────────────────────────────
router.get('/:id', getTaskById);

// ─── PUT    /api/v1/tasks/:id ─────────────────────────────────
router.put(
  '/:id',
  [
    body('title')
      .optional()
      .trim()
      .notEmpty().withMessage('Title cannot be empty')
      .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),

    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),

    body('status')
      .optional()
      .isIn(['pending', 'in-progress', 'completed'])
      .withMessage('Status must be pending, in-progress or completed'),
  ],
  validate,
  updateTask
);

// ─── DELETE /api/v1/tasks/:id ─────────────────────────────────
router.delete('/:id', deleteTask);

module.exports = router;