const express = require('express');
const router = express.Router();
const { placeOrder, getMyOrders, getAllOrders, updateOrderStatus } = require('../controllers/orderController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { validateRequired } = require('../middlewares/validateMiddleware');

router.post('/', protect, authorize('customer'), validateRequired(['shippingAddress']), placeOrder);
router.get('/my', protect, authorize('customer'), getMyOrders);
router.get('/', protect, authorize('seller', 'admin'), getAllOrders);
router.patch('/:id/status', protect, validateRequired(['status']), updateOrderStatus);

module.exports = router;