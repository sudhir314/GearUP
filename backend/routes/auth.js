const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Otp = require('../models/Otp');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sendOtpEmail = require('../utils/sendEmail'); // Import email utility

// Helper: Generate Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Helper: Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ------------------------------------------------------------------
// 1. REGISTER INIT: Sends OTP via Email
// ------------------------------------------------------------------
router.post('/register-init', async (req, res) => {
  const { name, email } = req.body;
  
  if (!name || !email) return res.status(400).json({ message: "Name and Email are required" });

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    // Generate and Save OTP
    const otp = generateOTP();
    await Otp.findOneAndUpdate(
      { email },
      { name, email, otp },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // --- SEND EMAIL HERE ---
    console.log(`Sending OTP to ${email}...`); // Log for debugging
    await sendOtpEmail(email, otp); 

    res.status(200).json({ message: `OTP sent to ${email}` });

  } catch (error) {
    console.error("Register Init Error:", error);
    res.status(500).json({ message: 'Failed to send OTP. Check server logs.' });
  }
});

// ------------------------------------------------------------------
// 2. VERIFY OTP
// ------------------------------------------------------------------
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

// ------------------------------------------------------------------
// 3. REGISTER FINALIZE
// ------------------------------------------------------------------
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

// ------------------------------------------------------------------
// LOGIN ROUTE
// ------------------------------------------------------------------
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

module.exports = router;