const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { register, login, refresh, logout, getMe } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const { validateRequired } = require('../middlewares/validateMiddleware');

router.post('/register', validateRequired(['name', 'email', 'password']), register);
router.post('/login', validateRequired(['email', 'password']), login);
router.post('/refresh', refresh);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

router.patch('/me', protect, validateRequired(['name']), async (req, res, next) => {
  try {
    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { name: req.body.name.trim() },
      { new: true, runValidators: true }
    );
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

module.exports = router;