const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { appEvents } = require('../events/appEvents');

exports.placeOrder = async (req, res, next) => {
  const deductedItems = []; // Track deductions for rollback if a later item fails
  try {
    const { shippingAddress } = req.body;
    const cart = await Cart.findOne({ customer: req.user._id }).populate('items.product');

    if (!cart || cart.items.length === 0) {
      res.status(400);
      return next(new Error('Your cart is empty'));
    }

    let totalAmount = 0;
    const orderItems = [];
    const lowStockThreshold = Number(process.env.LOW_STOCK_THRESHOLD) || 5;

    for (const item of cart.items) {
      const prod = item.product;
      if (!prod) {
        res.status(400);
        throw new Error('One of the products in your cart no longer exists');
      }

      // Atomic stock check & decrement prevents race conditions / negative stock
      const updatedProduct = await Product.findOneAndUpdate(
        { _id: prod._id, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true }
      );

      if (!updatedProduct) {
        res.status(400);
        throw new Error(`Insufficient stock for "${prod.name}". Checkout aborted.`);
      }

      deductedItems.push({ productId: prod._id, quantity: item.quantity });

      // Trigger low-stock event if remaining stock hits threshold
      if (updatedProduct.stock <= lowStockThreshold) {
        appEvents.emit('stockLow', updatedProduct);
      }

      totalAmount += prod.price * item.quantity;
      orderItems.push({
        product: prod._id,
        name: prod.name,
        price: prod.price,
        quantity: item.quantity,
        seller: prod.seller,
      });
    }

    const order = await Order.create({
      customer: req.user._id,
      items: orderItems,
      totalAmount,
      shippingAddress,
    });

    // Clear customer cart
    cart.items = [];
    await cart.save();

    // Emit decoupled application event
    appEvents.emit('orderPlaced', order);

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    // Rollback any already-deducted inventory if an error occurred midway
    for (const item of deductedItems) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } });
    }
    next(err);
  }
};

exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ customer: req.user._id }).sort('-createdAt');
    res.json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    next(err);
  }
};

exports.getAllOrders = async (req, res, next) => {
  try {
    const filter = req.user.role === 'seller' ? { 'items.seller': req.user._id } : {};
    const orders = await Order.find(filter).populate('customer', 'name email').sort('-createdAt');
    res.json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    next(err);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      return next(new Error('Order not found'));
    }

    if (order.status === 'Cancelled' || order.status === 'Delivered') {
      res.status(400);
      return next(new Error(`Cannot change status of an already ${order.status} order`));
    }

    // Customers can only cancel their own Pending orders
    if (req.user.role === 'customer') {
      if (order.customer.toString() !== req.user._id.toString()) {
        res.status(403);
        return next(new Error('Not authorized to modify this order'));
      }
      if (status !== 'Cancelled' || order.status !== 'Pending') {
        res.status(400);
        return next(new Error('Customers can only cancel Pending orders'));
      }
    }

    // Restore inventory if cancelled
    if (status === 'Cancelled') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
      }
    }

    order.status = status;
    await order.save();

    appEvents.emit('orderStatusUpdated', order);
    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};