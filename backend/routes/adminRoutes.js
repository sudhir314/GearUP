const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/authMiddleware');

// 1. GET ADMIN STATS (Dashboard Analytics)
router.get('/stats', protect, admin, async (req, res) => {
  try {
    // A. Basic Counts
    const usersCount = await User.countDocuments();
    const productsCount = await Product.countDocuments();
    const ordersCount = await Order.countDocuments();

    // B. Total Revenue (Sum of all non-cancelled orders)
    const totalRevenue = await Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } }
    ]);

    // C. Daily Sales (For Line Chart)
    const dailySales = await Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          sales: { $sum: "$totalPrice" },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }, // Sort by date ascending
      { $limit: 7 } // Last 7 days
    ]);

    // D. Product Categories (For Pie Chart)
    const productCategories = await Product.aggregate([
        {
            $group: {
                _id: "$category",
                count: { $sum: 1 }
            }
        }
    ]);

    res.json({
      usersCount,
      productsCount,
      ordersCount,
      totalRevenue: totalRevenue[0] ? totalRevenue[0].total : 0,
      dailySales,
      productCategories
    });

  } catch (error) {
    console.error("Stats Error:", error);
    res.status(500).json({ message: 'Error fetching stats' });
  }
});

// 2. Get All Users
router.get('/users', protect, admin, async (req, res) => {
  try {
      const users = await User.find({});
      res.json(users);
  } catch (error) {
      res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;