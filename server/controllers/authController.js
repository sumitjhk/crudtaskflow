// ============================================================
//  controllers/authController.js — Auth Logic
//  Handles: Register & Login
// ============================================================

const jwt    = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User   = require('../models/User');

// ─── Cookie Options ───────────────────────────────────────────
const cookieOptions = {
  httpOnly : true,
  secure   : true,
  sameSite : `none`,
  maxAge   : 7 * 24 * 60 * 60 * 1000
};

// ─── Generate JWT Token ───────────────────────────────────────
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// ─── @route   POST /api/v1/auth/register ─────────────────────
// ─── @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success : false,
        message : 'User with this email already exists',
      });
    }

    // Hash password manually before saving
    const salt           = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user with hashed password
    const user = await User.create({
      name,
      email,
      password : hashedPassword,
      role,
    });

    // Generate token
    const token = generateToken(user._id, user.role);

    // Set token in HTTP-only cookie
    res.cookie('token', token, cookieOptions);

    res.status(201).json({
      success : true,
      message : 'User registered successfully',
      user: {
        id    : user._id,
        name  : user.name,
        email : user.email,
        role  : user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── @route   POST /api/v1/auth/login ────────────────────────
// ─── @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email — include password field (hidden by default)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success : false,
        message : 'Invalid email or password',
      });
    }

    // Compare entered password with hashed password in DB
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success : false,
        message : 'Invalid email or password',
      });
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    // Set token in HTTP-only cookie
    res.cookie('token', token, cookieOptions);

    res.status(200).json({
      success : true,
      message : 'Login successful',
      user: {
        id    : user._id,
        name  : user.name,
        email : user.email,
        role  : user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── @route   POST /api/v1/auth/logout ───────────────────────
// ─── @access  Private
const logout = async (req, res) => {
  res.clearCookie('token', cookieOptions);
  res.status(200).json({
    success : true,
    message : 'Logged out successfully',
  });
};

module.exports = { register, login, logout };