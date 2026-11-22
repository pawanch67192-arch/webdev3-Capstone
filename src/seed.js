require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Cart = require('./models/Cart');
const Order = require('./models/Order');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    await Promise.all([
      User.deleteMany(),
      Category.deleteMany(),
      Product.deleteMany(),
      Cart.deleteMany(),
      Order.deleteMany(),
    ]);

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@store.com',
      password: 'password123',
      role: 'admin',
    });

    const seller = await User.create({
      name: 'Tech Seller',
      email: 'seller@store.com',
      password: 'password123',
      role: 'seller',
    });

    const customer = await User.create({
      name: 'You',
      email: 'customer@store.com',
      password: 'password123',
      role: 'customer',
    });

    const [electronics, accessories, audio, workspace] = await Category.create([
      { name: 'Electronics', description: 'Laptops, monitors, tablets, and computing hardware' },
      { name: 'Accessories', description: 'Keyboards, mice, hubs, and cables' },
      { name: 'Audio & Wearables', description: 'Headphones, speakers, and smartwatches' },
      { name: 'Workspace & Ergonomics', description: 'Laptop stands, desk mats, and lamps' },
    ]);

    const products = await Product.create([
      {
        name: 'Mechanical Keyboard',
        description: 'RGB Backlit Hot-Swappable Tactile Switch Keyboard',
        price: 4999,
        stock: 6, // Buying 2 units triggers lowStockAlert (<= 5)
        category: accessories._id,
        seller: seller._id,
      },
      {
        name: 'Wireless Ergonomic Mouse',
        description: '2.4GHz + Bluetooth Silent Click Rechargeable Mouse',
        price: 1899,
        stock: 25,
        category: accessories._id,
        seller: seller._id,
      },
      {
        name: '27-inch 4K IPS Monitor',
        description: 'UHD 3840x2160 USB-C 65W PD Professional Display',
        price: 24999,
        stock: 8,
        category: electronics._id,
        seller: seller._id,
      },
      {
        name: '14-inch Macbook Pro',
        description: '16GB RAM, 512GB NVMe SSD, Backlit Keyboard Laptop',
        price: 239999,
        stock: 4, // Already low stock
        category: electronics._id,
        seller: seller._id,
      },
      {
        name: '1TB Portable NVMe SSD',
        description: 'USB 3.2 Gen 2 High-Speed External Solid State Drive (1050MB/s)',
        price: 7499,
        stock: 18,
        category: electronics._id,
        seller: seller._id,
      },
      {
        name: '7-in-1 USB-C Multiport Hub',
        description: '4K HDMI, 100W PD Charging, SD Card Reader & 3x USB 3.0',
        price: 2499,
        stock: 30,
        category: accessories._id,
        seller: seller._id,
      },
      {
        name: 'Active Noise Cancelling Headphones',
        description: 'Over-Ear Wireless ANC Headphones with 40-Hour Battery',
        price: 8999,
        stock: 12,
        category: audio._id,
        seller: seller._id,
      },
      {
        name: 'True Wireless Earbuds',
        description: 'Low-Latency Gaming & Music TWS with Quad-Mic ENC',
        price: 2199,
        stock: 40,
        category: audio._id,
        seller: seller._id,
      },
      {
        name: 'AMOLED Fitness Smartwatch',
        description: '1.78-inch Always-On Display, SpO2 & Heart Rate Tracker',
        price: 3499,
        stock: 15,
        category: audio._id,
        seller: seller._id,
      },
      {
        name: 'Aluminum Adjustable Laptop Stand',
        description: 'Foldable Ventilated Ergonomic Riser for 11–17" Laptops',
        price: 1299,
        stock: 22,
        category: workspace._id,
        seller: seller._id,
      },
      {
        name: 'Extended Vegan Leather Desk Mat',
        description: 'Waterproof Anti-Slip Dual-Sided Desk Pad (90cm x 40cm)',
        price: 899,
        stock: 35,
        category: workspace._id,
        seller: seller._id,
      },
      {
        name: '1080p Full HD Autofocus Webcam',
        description: 'Dual Noise-Reducing Mics & Privacy Shutter for Meetings',
        price: 2799,
        stock: 5, // Low stock threshold boundary
        category: workspace._id,
        seller: seller._id,
      },
    ]);

    // Seed sample historical orders for immediate Analytics & Order History visibility
    await Order.create([
      {
        customer: customer._id,
        items: [
          {
            product: products[1]._id,
            name: products[1].name,
            price: products[1].price,
            quantity: 2,
            seller: seller._id,
          },
          {
            product: products[10]._id,
            name: products[10].name,
            price: products[10].price,
            quantity: 1,
            seller: seller._id,
          },
        ],
        totalAmount: 4697,
        shippingAddress: 'Hostel Block B, Sector 62, Gurugram',
        status: 'Delivered',
      },
      {
        customer: customer._id,
        items: [
          {
            product: products[6]._id,
            name: products[6].name,
            price: products[6].price,
            quantity: 1,
            seller: seller._id,
          },
        ],
        totalAmount: 8999,
        shippingAddress: 'Hostel Block B, Sector 62, Gurugram',
        status: 'Confirmed',
      },
    ]);

    console.log('Seed complete with 12 products across 4 categories!');
    console.log('Admin:    admin@store.com    / password123');
    console.log('Seller:   seller@store.com   / password123');
    console.log('Customer: customer@store.com / password123');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
};

seedData();