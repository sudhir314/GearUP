const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const { protect, admin } = require('../middleware/authMiddleware');

// 1. GET ALL COUPONS
router.get('/', protect, admin, async (req, res) => {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching coupons' });
  }
});

// 2. CREATE COUPON
router.post('/', protect, admin, async (req, res) => {
  try {
    const { code, discountPercentage } = req.body;
    // Check if duplicate
    const exists = await Coupon.findOne({ code: code.toUpperCase() });
    if (exists) return res.status(400).json({ message: 'Coupon code already exists' });

    const coupon = new Coupon({ 
        code: code.toUpperCase(), 
        discountPercentage,
        isActive: true
    });
    await coupon.save();
    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ message: 'Error creating coupon' });
  }
});

// 3. DELETE COUPON
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ message: 'Coupon deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting coupon' });
  }
});

// 4. VERIFY COUPON (For Checkout)
router.post('/verify', async (req, res) => {
  const { code } = req.body;
  try {
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (coupon && coupon.isActive) {
        res.json({ code: coupon.code, discountPercentage: coupon.discountPercentage });
    } else {
        res.status(404).json({ message: 'Invalid or expired coupon' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;