// File: backend/routes/couponRoutes.js

const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const { protect, admin } = require('../middleware/authMiddleware');
const nodemailer = require('nodemailer'); 

// --- UPDATED EMAIL CONFIG (PORT 465 FOR SSL) ---
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465, // CHANGED to 465
  secure: true, // CHANGED to true
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 20000,
  greetingTimeout: 20000,
  socketTimeout: 20000
});

// ... rest of the file remains the same ...
// (Include your existing routes: /subscribe, /, /verify, etc.)

router.post('/subscribe', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to Phitku! Here is your 10% Discount',
      html: `
        <h1>Welcome to the Tribe! 🌿</h1>
        <p>Use code: <b>WELCOME10</b></p>
        <a href="${process.env.CLIENT_URL}/shop">Shop Now</a>
      `
    });
    res.json({ message: 'Voucher sent successfully!' });
  } catch (error) {
    console.error("Newsletter Error:", error);
    res.status(500).json({ message: 'Failed to send email. Connection Timeout.' });
  }
});

// ... keep other existing admin routes below ...
router.post('/', protect, admin, async (req, res) => {
  try {
    const { code, discountPercentage } = req.body;
    if (await Coupon.findOne({ code: code.toUpperCase() })) return res.status(400).json({ message: 'Exists' });
    const coupon = new Coupon({ code: code.toUpperCase(), discountPercentage });
    await coupon.save();
    res.status(201).json(coupon);
  } catch (error) { res.status(500).json({ message: 'Error' }); }
});

router.get('/', protect, admin, async (req, res) => {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) { res.status(500).json({ message: 'Error' }); }
});

router.delete('/:id', protect, admin, async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (error) { res.status(500).json({ message: 'Error' }); }
});

router.post('/verify', async (req, res) => {
  const { code } = req.body;
  if (code.toUpperCase() === 'WELCOME10') return res.json({ code: 'WELCOME10', discountPercentage: 10 });
  try {
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (coupon && coupon.isActive) res.json({ code: coupon.code, discountPercentage: coupon.discountPercentage });
    else res.status(404).json({ message: 'Invalid coupon' });
  } catch (error) { res.status(500).json({ message: 'Error' }); }
});

module.exports = router;