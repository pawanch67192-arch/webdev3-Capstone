const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true }, // Price & name snapshot at purchase time
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

const orderSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true, min: 0 },
    shippingAddress: { type: String, required: [true, 'Shipping address is required'] },
    paymentStatus: { type: String, default: 'Simulated_Paid' },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

// Syllabus Index 3: Compound index for user order history sorted by newest
orderSchema.index({ customer: 1, createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);