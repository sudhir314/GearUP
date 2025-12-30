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

// ==================================================================
// SECTION A: REGISTRATION & LOGIN
// ==================================================================

// 1. REGISTER INIT: Sends OTP via Email
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

    // Send Email
    console.log(`Sending OTP to ${email}...`); 
    await sendOtpEmail(email, otp); 

    res.status(200).json({ message: `OTP sent to ${email}` });

  } catch (error) {
    console.error("Register Init Error:", error);
    res.status(500).json({ message: 'Failed to send OTP.' });
  }
});

// 2. VERIFY OTP (Registration)
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
// SECTION B: FORGOT PASSWORD (THIS WAS MISSING)
// ==================================================================

// 5. SEND PASSWORD RESET OTP
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found with this email" });
    }

    // Generate OTP
    const otp = generateOTP();

    // Save OTP to DB
    await Otp.findOneAndUpdate(
      { email },
      { name: user.name, email, otp },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Send Email
    console.log(`Sending Reset OTP to ${email}...`);
    await sendOtpEmail(email, otp);

    res.status(200).json({ message: "OTP sent successfully" });

  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// 6. VERIFY FORGOT PASSWORD OTP
router.post('/verify-forgot-otp', async (req, res) => {
    const { email, otp } = req.body;

    try {
        const record = await Otp.findOne({ email });
        if (!record || record.otp !== otp) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }
        res.status(200).json({ message: "OTP Verified" });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});

// 7. RESET PASSWORD (FINAL STEP)
router.post('/reset-password', async (req, res) => {
  const { email, otp, password } = req.body;

  try {
    // Verify OTP again for security
    const record = await Otp.findOne({ email });
    if (!record || record.otp !== otp) {
      return res.status(400).json({ message: "Invalid Session. Please try again." });
    }

    // Update Password
    const user = await User.findOne({ email });
    if (user) {
      user.password = password; // The User model will hash this automatically
      await user.save();
      
      // Clear OTP
      await Otp.deleteOne({ email });
      
      res.status(200).json({ message: "Password Reset Successfully" });
    } else {
      res.status(404).json({ message: "User not found" });
    }

  } catch (error) {
    res.status(500).json({ message: "Server Error: " + error.message });
  }
});

module.exports = router;