// ============================================================
//  controllers/taskController.js — Task CRUD Logic
//  All routes are protected — req.user is set by authMiddleware
//  Includes: pagination, filter by status, search by title
//  Includes: AES encryption on task description
// ============================================================

const Task      = require('../models/Task');
const CryptoJS  = require('crypto-js');

// ─── AES Helpers ─────────────────────────────────────────────
const encrypt = (text) => {
  if (!text) return '';
  return CryptoJS.AES.encrypt(text, process.env.AES_SECRET).toString();
};

const decrypt = (text) => {
  if (!text) return '';
  try {
    const bytes = CryptoJS.AES.decrypt(text, process.env.AES_SECRET);
    return bytes.toString(CryptoJS.enc.Utf8) || text;
  } catch {
    return text; // return as-is if decryption fails
  }
};

// ─── Format task — decrypt description before sending ────────
const formatTask = (task) => ({
  _id         : task._id,
  title       : task.title,
  description : decrypt(task.description),
  status      : task.status,
  owner       : task.owner,
  createdAt   : task.createdAt,
  updatedAt   : task.updatedAt,
});

// ─── @route   POST /api/v1/tasks ─────────────────────────────
// ─── @access  Private
const createTask = async (req, res, next) => {
  try {
    const { title, description, status } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({
        success : false,
        message : 'Task title is required',
      });
    }

    const task = await Task.create({
      title       : title.trim(),
      description : encrypt(description?.trim()), // encrypted before saving
      status      : status || 'pending',
      owner       : req.user._id,
    });

    res.status(201).json({
      success : true,
      message : 'Task created successfully',
      data    : formatTask(task), // decrypted before sending
    });
  } catch (error) {
    next(error);
  }
};

// ─── @route   GET /api/v1/tasks ──────────────────────────────
// ─── @access  Private
// ─── @query   page, limit, status, search
const getAllTasks = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;

    const filter = { owner: req.user._id };

    if (status && ['pending', 'in-progress', 'completed'].includes(status)) {
      filter.status = status;
    }

    if (search && search.trim() !== '') {
      filter.title = { $regex: search.trim(), $options: 'i' };
    }

    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip     = (pageNum - 1) * limitNum;

    const [tasks, total] = await Promise.all([
      Task.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Task.countDocuments(filter),
    ]);

    res.status(200).json({
      success    : true,
      count      : tasks.length,
      total      : total,
      page       : pageNum,
      totalPages : Math.ceil(total / limitNum),
      data       : tasks.map(formatTask), // decrypt all descriptions
    });
  } catch (error) {
    next(error);
  }
};

// ─── @route   GET /api/v1/tasks/:id ──────────────────────────
// ─── @access  Private
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success : false,
        message : 'Task not found',
      });
    }

    if (task.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success : false,
        message : 'Not authorized to access this task',
      });
    }

    res.status(200).json({
      success : true,
      data    : formatTask(task), // decrypted before sending
    });
  } catch (error) {
    next(error);
  }
};

// ─── @route   PUT /api/v1/tasks/:id ──────────────────────────
// ─── @access  Private
const updateTask = async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success : false,
        message : 'Task not found',
      });
    }

    if (task.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success : false,
        message : 'Not authorized to update this task',
      });
    }

    const { title, description, status } = req.body;
    const allowedUpdates = {};
    if (title)                     allowedUpdates.title       = title.trim();
    if (description !== undefined) allowedUpdates.description = encrypt(description.trim()); // encrypt before saving
    if (status)                    allowedUpdates.status      = status;

    task = await Task.findByIdAndUpdate(
      req.params.id,
      allowedUpdates,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success : true,
      message : 'Task updated successfully',
      data    : formatTask(task), // decrypted before sending
    });
  } catch (error) {
    next(error);
  }
};

// ─── @route   DELETE /api/v1/tasks/:id ───────────────────────
// ─── @access  Private
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success : false,
        message : 'Task not found',
      });
    }

    if (task.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success : false,
        message : 'Not authorized to delete this task',
      });
    }

    await task.deleteOne();

    res.status(200).json({
      success : true,
      message : 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createTask, getAllTasks, getTaskById, updateTask, deleteTask };
// ```

// Now add `AES_SECRET` to your `.env` file:
// ```
// AES_SECRET=my_super_secret_aes_key_2024