const express = require('express');
const router = express.Router();
const {
  createCategory,
  getCategories,
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { validateRequired } = require('../middlewares/validateMiddleware');

// Categories
router.get('/categories', getCategories);
router.post('/categories', protect, authorize('admin'), validateRequired(['name']), createCategory);

// Products
router.get('/', getProducts);
router.get('/:id', getProductById);
router.post(
  '/',
  protect,
  authorize('seller', 'admin'),
  validateRequired(['name', 'description', 'price', 'stock', 'category']),
  createProduct
);
router.patch('/:id', protect, authorize('seller', 'admin'), updateProduct);
router.delete('/:id', protect, authorize('seller', 'admin'), deleteProduct);

module.exports = router;