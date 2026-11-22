const express = require('express');
const router = express.Router();
const { getSalesSummary, getInventoryReport } = require('../controllers/reportController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.get('/sales', protect, authorize('seller', 'admin'), getSalesSummary);
router.get('/inventory', protect, authorize('seller', 'admin'), getInventoryReport);

module.exports = router;