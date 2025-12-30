const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/authMiddleware');

// GET ADMIN DASHBOARD STATS
router.get('/stats', protect, admin, async (req, res) => {
  try {
    // A. Basic Counts
    const usersCount = await User.countDocuments();
    const productsCount = await Product.countDocuments();
    const ordersCount = await Order.countDocuments();

    // B. Total Revenue
    const totalRevenueResult = await Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } }
    ]);
    const totalRevenue = totalRevenueResult[0] ? totalRevenueResult[0].total : 0;

    // C. Daily Sales Graph Data
    const dailySales = await Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          sales: { $sum: "$totalPrice" }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 7 }
    ]);

    res.json({
      usersCount,
      productsCount,
      ordersCount,
      totalRevenue,
      dailySales
    });

  } catch (error) {
    console.error("Stats Error:", error);
    res.status(500).json({ message: 'Error fetching stats' });
  }
});

module.exports = router;