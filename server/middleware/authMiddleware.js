// ============================================================
//  middleware/authMiddleware.js — JWT Verification
//  Reads token from HTTP-only cookie instead of header
// ============================================================

const jwt  = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // Read token from HTTP-only cookie
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // No token found — reject request
  if (!token) {
    return res.status(401).json({
      success : false,
      message : 'Not authorized, please login first',
    });
  }

  try {
    // Verify token signature using JWT secret from .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request object (without password)
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({
        success : false,
        message : 'Not authorized, user no longer exists',
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success : false,
      message : 'Not authorized, token is invalid or expired',
    });
  }
};

module.exports = { protect };