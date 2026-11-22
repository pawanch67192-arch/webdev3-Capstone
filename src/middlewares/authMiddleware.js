const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    return next(new Error('Not authorized, no access token provided'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = await User.findById(decoded.id);
    if (!req.user) {
      res.status(401);
      return next(new Error('User belonging to this token no longer exists'));
    }
    next();
  } catch (err) {
    res.status(401);
    next(new Error('Not authorized, token invalid or expired'));
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.status(403);
      return next(new Error(`Role '${req.user.role}' is not permitted to access this resource`));
    }
    next();
  };
};

module.exports = { protect, authorize };