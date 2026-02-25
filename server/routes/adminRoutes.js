// ============================================================
//  routes/adminRoutes.js — Admin Routes
//  Base path: /api/v1/admin
//  All routes require JWT token + admin role
// ============================================================

const express                      = require('express');
const { getAllUsers, deleteUser }   = require('../controllers/adminController');
const { protect }                  = require('../middleware/authMiddleware');
const { authorizeRole }            = require('../middleware/roleMiddleware');

const router = express.Router();

// Apply both protect and admin role check to ALL routes in this file
router.use(protect);
router.use(authorizeRole('admin'));

// ─── GET    /api/v1/admin/users ───────────────────────────────
router.get('/users', getAllUsers);

// ─── DELETE /api/v1/admin/users/:id ──────────────────────────
router.delete('/users/:id', deleteUser);

module.exports = router;