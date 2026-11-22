const Order = require('../models/Order');
const Product = require('../models/Product');

// Aggregation 1: Top-Selling Products & Revenue Breakdown
exports.getSalesSummary = async (req, res, next) => {
  try {
    const summary = await Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          productName: { $first: '$items.name' },
          totalUnitsSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);

    res.json({ success: true, count: summary.length, data: summary });
  } catch (err) {
    next(err);
  }
};

// Aggregation 2: Category-wise Inventory Valuation & Low-Stock Metrics
exports.getInventoryReport = async (req, res, next) => {
  try {
    const threshold = Number(req.query.threshold) || Number(process.env.LOW_STOCK_THRESHOLD) || 5;

    const inventoryStats = await Product.aggregate([
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryInfo',
        },
      },
      { $unwind: '$categoryInfo' },
      {
        $group: {
          _id: '$categoryInfo.name',
          totalProducts: { $sum: 1 },
          totalUnitsInStock: { $sum: '$stock' },
          inventoryValue: { $sum: { $multiply: ['$price', '$stock'] } },
          lowStockItems: {
            $sum: { $cond: [{ $lte: ['$stock', threshold] }, 1, 0] },
          },
        },
      },
      { $sort: { inventoryValue: -1 } },
    ]);

    res.json({ success: true, thresholdUsed: threshold, data: inventoryStats });
  } catch (err) {
    next(err);
  }
};