const validateRequired = (fields) => (req, res, next) => {
  const missing = fields.filter((field) => req.body[field] === undefined || req.body[field] === '');
  if (missing.length > 0) {
    res.status(400);
    return next(new Error(`Missing required fields: ${missing.join(', ')}`));
  }
  next();
};

module.exports = { validateRequired };