const EventEmitter = require('events');

class AppEventEmitter extends EventEmitter {}
const appEvents = new AppEventEmitter();

// Decoupled internal event listener initialized with Socket.IO instance
const registerEventListeners = (io) => {
  // Event 1: Order Placed -> Notify customer & sellers in real time
  appEvents.on('orderPlaced', (order) => {
    console.log(`[EventEmitter] Order Placed: ${order._id} | Total: $${order.totalAmount}`);
    io.emit('orderNotification', {
      type: 'NEW_ORDER',
      orderId: order._id,
      status: order.status,
      totalAmount: order.totalAmount,
      timestamp: new Date(),
    });
  });

  // Event 2: Stock Low -> Alert sellers/admins when stock drops below threshold
  appEvents.on('stockLow', (product) => {
    console.log(`[EventEmitter] Low Stock Alert: ${product.name} (${product.stock} left)`);
    io.emit('lowStockAlert', {
      productId: product._id,
      name: product.name,
      remainingStock: product.stock,
      message: `Inventory warning: ${product.name} has only ${product.stock} units left!`,
    });
  });

  // Event 3: Order Status Updated
  appEvents.on('orderStatusUpdated', (order) => {
    console.log(`[EventEmitter] Order ${order._id} updated to ${order.status}`);
    io.emit('orderNotification', {
      type: 'STATUS_UPDATE',
      orderId: order._id,
      status: order.status,
      timestamp: new Date(),
    });
  });
};

module.exports = { appEvents, registerEventListeners };