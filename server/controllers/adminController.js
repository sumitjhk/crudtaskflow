// ============================================================
//  controllers/adminController.js — Admin Logic
//  All routes are protected + admin role required
// ============================================================

const User = require('../models/User');
const Task = require('../models/Task');

// ─── @route   GET /api/v1/admin/users ────────────────────────
// ─── @access  Private / Admin
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    res.status(200).json({
      success : true,
      count   : users.length,
      data    : users,
    });
  } catch (error) {
    next(error);
  }
};

// ─── @route   DELETE /api/v1/admin/users/:id ─────────────────
// ─── @access  Private / Admin
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success : false,
        message : 'User not found',
      });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success : false,
        message : 'Admin cannot delete their own account',
      });
    }

    // Delete all tasks belonging to this user as well
    await Task.deleteMany({ owner: user._id });

    await user.deleteOne();

    res.status(200).json({
      success : true,
      message : 'User and their tasks deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllUsers, deleteUser };