// ============================================================
//  middleware/roleMiddleware.js — Role Based Access Control
//  Runs after authMiddleware (protect) on admin routes
//  Checks if the logged in user has the required role
// ============================================================

const authorizeRole = (...roles) => {
  return (req, res, next) => {
    // req.user is set by authMiddleware before this runs
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success : false,
        message : `Access denied. Role '${req.user.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};

module.exports = { authorizeRole };