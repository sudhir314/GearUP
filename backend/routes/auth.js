const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Otp = require('../models/Otp');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sendOtpEmail = require('../utils/sendEmail');
const { protect } = require('../middleware/authMiddleware'); // Import protect for secure routes

// Helper: Generate Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Helper: Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ==================================================================
// SECTION A: REGISTRATION & LOGIN
// ==================================================================

// 1. REGISTER INIT
router.post('/register-init', async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) return res.status(400).json({ message: "Name and Email are required" });

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const otp = generateOTP();
    await Otp.findOneAndUpdate(
      { email },
      { name, email, otp },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log(`Sending OTP to ${email}...`); 
    await sendOtpEmail(email, otp); 

    res.status(200).json({ message: `OTP sent to ${email}` });
  } catch (error) {
    console.error("Register Init Error:", error);
    res.status(500).json({ message: 'Failed to send OTP.' });
  }
});

// 2. VERIFY OTP
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  try {
    const record = await Otp.findOne({ email });
    if (!record) return res.status(400).json({ message: "OTP expired or not found." });
    if (record.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });
    res.status(200).json({ message: "OTP Verified" });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// 3. REGISTER FINALIZE
router.post('/register-finalize', async (req, res) => {
  const { email, otp, password } = req.body;
  try {
    const record = await Otp.findOne({ email });
    if (!record || record.otp !== otp) return res.status(400).json({ message: "Invalid session or OTP" });

    const user = await User.create({
      name: record.name,
      email: record.email,
      password: password
    });
    await Otp.deleteOne({ email });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
});

// 4. LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// ==================================================================
// SECTION B: FORGOT PASSWORD
// ==================================================================

// 5. SEND RESET OTP
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = generateOTP();
    await Otp.findOneAndUpdate(
      { email },
      { name: user.name, email, otp },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log(`Sending Reset OTP to ${email}...`);
    await sendOtpEmail(email, otp);

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// 6. VERIFY FORGOT OTP
router.post('/verify-forgot-otp', async (req, res) => {
    const { email, otp } = req.body;
    try {
        const record = await Otp.findOne({ email });
        if (!record || record.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });
        res.status(200).json({ message: "OTP Verified" });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});

// 7. RESET PASSWORD
router.post('/reset-password', async (req, res) => {
  const { email, otp, password } = req.body;
  try {
    const record = await Otp.findOne({ email });
    if (!record || record.otp !== otp) return res.status(400).json({ message: "Invalid Session" });

    const user = await User.findOne({ email });
    if (user) {
      user.password = password; 
      await user.save();
      await Otp.deleteOne({ email });
      res.status(200).json({ message: "Password Reset Successfully" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// ==================================================================
// SECTION C: USER PROFILE & ADDRESS (NEW - FIXES CHECKOUT)
// ==================================================================

// 8. GET PROFILE (Used in Checkout)
router.get('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                addresses: user.addresses || []
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// 9. SAVE ADDRESS
router.post('/save-address', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            const newAddress = req.body.address; // Checkout sends { address: formData }
            if(!user.addresses) user.addresses = [];
            
            user.addresses.push(newAddress);
            await user.save();
            
            res.json({ message: "Address saved", addresses: user.addresses });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        console.error("Save Address Error:", error);
        res.status(500).json({ message: "Server Error saving address" });
    }
});

module.exports = router;