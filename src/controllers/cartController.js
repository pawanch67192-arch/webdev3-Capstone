const Cart = require('../models/Cart');
const Product = require('../models/Product');

exports.getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ customer: req.user._id }).populate('items.product', 'name price stock');
    if (!cart) {
      cart = await Cart.create({ customer: req.user._id, items: [] });
    }

    const totalAmount = cart.items.reduce((sum, item) => {
      return item.product ? sum + item.product.price * item.quantity : sum;
    }, 0);

    res.json({ success: true, totalAmount, data: cart });
  } catch (err) {
    next(err);
  }
};

exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const qty = Number(quantity);
    if (qty < 1) {
      res.status(400);
      return next(new Error('Quantity must be at least 1'));
    }

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404);
      return next(new Error('Product not found'));
    }
    if (product.stock < qty) {
      res.status(400);
      return next(new Error(`Insufficient stock. Only ${product.stock} available`));
    }

    let cart = await Cart.findOne({ customer: req.user._id });
    if (!cart) cart = new Cart({ customer: req.user._id, items: [] });

    const existingIndex = cart.items.findIndex((item) => item.product.toString() === productId);
    if (existingIndex > -1) {
      const newQty = cart.items[existingIndex].quantity + qty;
      if (product.stock < newQty) {
        res.status(400);
        return next(new Error(`Cannot add more. Total exceeds stock (${product.stock})`));
      }
      cart.items[existingIndex].quantity = newQty;
    } else {
      cart.items.push({ product: productId, quantity: qty });
    }

    await cart.save();
    res.status(200).json({ success: true, message: 'Cart updated', data: cart });
  } catch (err) {
    next(err);
  }
};

exports.removeFromCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ customer: req.user._id });
    if (!cart) {
      res.status(404);
      return next(new Error('Cart not found'));
    }

    cart.items = cart.items.filter((item) => item.product.toString() !== req.params.productId);
    await cart.save();
    res.json({ success: true, message: 'Item removed from cart', data: cart });
  } catch (err) {
    next(err);
  }
};