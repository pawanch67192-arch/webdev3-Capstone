const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Product name is required'], trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: [0, 'Price cannot be negative'] },
    stock: { type: Number, required: true, min: [0, 'Stock cannot be negative'], default: 0 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Syllabus Index 1: Text index for fast product search
productSchema.index({ name: 'text', description: 'text' });
// Syllabus Index 2: Compound index for category filtering and price sorting
productSchema.index({ category: 1, price: 1 });

module.exports = mongoose.model('Product', productSchema);