// ============================================================
//  models/Task.js — Task Schema
//  Defines the structure of a Task document in MongoDB
// ============================================================

const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema(
  {
    title: {
      type      : String,
      required  : [true, 'Task title is required'],
      trim      : true,
      maxlength : [100, 'Title cannot exceed 100 characters'],
    },

    description: {
      type      : String,
      trim      : true,
      default   : '',
      maxlength : [500, 'Description cannot exceed 500 characters'],
    },

    status: {
      type    : String,
      enum    : {
        values  : ['pending', 'in-progress', 'completed'],
        message : 'Status must be pending, in-progress or completed',
      },
      default : 'pending',
    },

    // Reference to the User who owns this task
    owner: {
      type     : mongoose.Schema.Types.ObjectId,
      ref      : 'User',
      required : [true, 'Task must belong to a user'],
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

// ─── Index for faster queries ─────────────────────────────────
TaskSchema.index({ owner: 1, createdAt: -1 });
TaskSchema.index({ owner: 1, status: 1  });

module.exports = mongoose.model('Task', TaskSchema);