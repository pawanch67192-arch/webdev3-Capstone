const express = require('express');
const router = express.Router();
const { getCart, addToCart, removeFromCart } = require('../controllers/cartController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { validateRequired } = require('../middlewares/validateMiddleware');

router.use(protect, authorize('customer'));

router.get('/', getCart);
router.post('/', validateRequired(['productId', 'quantity']), addToCart);
router.delete('/:productId', removeFromCart);

module.exports = router;