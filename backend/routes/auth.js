const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Otp = require('../models/Otp'); // Import the new Otp model
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Helper: Generate Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Helper: Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ------------------------------------------------------------------
// 1. REGISTER INIT: Receives Name & Email -> Generates OTP
// ------------------------------------------------------------------
router.post('/register-init', async (req, res) => {
  const { name, email } = req.body;
  
  if (!name || !email) return res.status(400).json({ message: "Name and Email are required" });

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    // Generate OTP
    const otp = generateOTP();

    // Save Name, Email, and OTP to temporary DB
    // (We use upsert: true to update if they request OTP multiple times)
    await Otp.findOneAndUpdate(
      { email },
      { name, email, otp },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // --- IMPORTANT: LOG OTP TO CONSOLE (Since we don't have an email server setup yet) ---
    console.log("========================================");
    console.log(`OTP for ${email}: ${otp}`);
    console.log("========================================");

    // In a real app, you would send this via email (Brevo/SendGrid)
    res.status(200).json({ message: 'OTP sent successfully' });

  } catch (error) {
    console.error("Register Init Error:", error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// ------------------------------------------------------------------
// 2. VERIFY OTP: Checks if OTP matches
// ------------------------------------------------------------------
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  try {
    const record = await Otp.findOne({ email });

    if (!record) {
      return res.status(400).json({ message: "OTP expired or not found. Try again." });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    res.status(200).json({ message: "OTP Verified" });

  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// ------------------------------------------------------------------
// 3. REGISTER FINALIZE: Receives Password -> Creates User
// ------------------------------------------------------------------
router.post('/register-finalize', async (req, res) => {
  const { email, otp, password } = req.body;

  try {
    // 1. Verify OTP one last time
    const record = await Otp.findOne({ email });
    if (!record || record.otp !== otp) {
      return res.status(400).json({ message: "Invalid session or OTP" });
    }

    // 2. Create the User (We get the 'name' from the OTP record)
    const user = await User.create({
      name: record.name,
      email: record.email,
      password: password
    });

    // 3. Delete the used OTP
    await Otp.deleteOne({ email });

    // 4. Return Login Token
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
// STANDARD LOGIN (Keep this for existing users)
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