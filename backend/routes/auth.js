const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// --- 1. BREVO CONFIGURATION ---
const SibApiV3Sdk = require('sib-api-v3-sdk');
const defaultClient = SibApiV3Sdk.ApiClient.instance;

// Debug Check
if (!process.env.BREVO_API_KEY || !process.env.SENDER_EMAIL) {
    console.error("❌ CRITICAL ERROR: Missing Email Keys in .env file");
}

const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

// --- 2. SEND EMAIL FUNCTION (Mobile Gear) ---
const sendEmail = async (to, subject, textContent) => {
  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h2 style="color: #2563EB;">Mobile Gear</h2>
      <p style="font-size: 16px;">${textContent}</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 12px; color: #777;">Sent by Mobile Gear Team.</p>
    </div>`;
  
  // Uses the verified sender from your .env
  sendSmtpEmail.sender = { 
      "name": "Mobile Gear Team", 
      "email": process.env.SENDER_EMAIL 
  }; 
  sendSmtpEmail.to = [{ "email": to }];

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`✅ Email sent successfully to ${to}`);
  } catch (error) {
    console.error("❌ EMAIL FAILED. Reason:");
    if (error.response && error.response.text) {
        console.error(error.response.text); // Prints the exact reason from Brevo
    } else {
        console.error(error);
    }
    throw error; 
  }
};

// --- 3. HELPER FUNCTIONS ---
const generateAccessToken = (id, isAdmin) => jwt.sign({ id, isAdmin }, process.env.JWT_SECRET, { expiresIn: '15m' });
const generateRefreshToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
const setRefreshTokenCookie = (res, refreshToken) => {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 30*24*60*60*1000,
  });
};

// --- 4. ROUTES ---

// REGISTER STEP 1
router.post('/register-init', async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) return res.status(400).json({ message: 'Name and Email required' });

    const emailLower = email.toLowerCase().trim();
    let user = await User.findOne({ email: emailLower });
    
    if (user && user.isVerified) return res.status(400).json({ message: 'User already exists. Please Login.' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000;

    if (user) {
      user.name = name; user.otp = otp; user.otpExpires = otpExpires;
      await user.save();
    } else {
      user = new User({ name, email: emailLower, isVerified: false, otp, otpExpires });
      await user.save();
    }

    await sendEmail(emailLower, 'Your Verification Code', `Hi ${name},<br><br>Your code is: <b style="color:#2563EB; font-size:20px;">${otp}</b>`);
    res.status(200).json({ message: 'OTP sent!' });

  } catch (err) {
    // Error is already logged in the terminal
    res.status(500).json({ message: 'Server Error. Check backend terminal for details.' });
  }
});

// VERIFY OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || String(user.otp).trim() !== String(otp).trim() || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    res.status(200).json({ message: 'OTP Verified' });
  } catch (err) { res.status(500).json({ message: 'Server Error' }); }
});

// FINALIZE REGISTRATION
router.post('/register-finalize', async (req, res) => {
  try {
    const { email, otp, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || String(user.otp).trim() !== String(otp).trim() || user.otpExpires < Date.now()) {
        return res.status(400).json({ message: 'Session invalid' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.isVerified = true; user.otp = undefined; user.otpExpires = undefined;
    await user.save();

    const accessToken = generateAccessToken(user._id, user.isAdmin);
    const refreshToken = generateRefreshToken(user._id);
    setRefreshTokenCookie(res, refreshToken);

    res.json({ message: 'Registration Complete!', accessToken, user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin } });
  } catch (err) { res.status(500).json({ message: 'Finalization failed' }); }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !user.isVerified) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const accessToken = generateAccessToken(user._id, user.isAdmin);
    const refreshToken = generateRefreshToken(user._id);
    setRefreshTokenCookie(res, refreshToken);

    res.json({ accessToken, user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin } });
  } catch (err) { res.status(500).json({ message: 'Server Error' }); }
});

// FORGOT PASSWORD
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const emailLower = email.toLowerCase().trim();
    const user = await User.findOne({ email: emailLower });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; 
    user.otp = otp; user.otpExpires = otpExpires;
    await user.save();

    await sendEmail(emailLower, 'Reset Password - Mobile Gear', `Your reset code is: <b>${otp}</b>`);
    res.json({ message: 'OTP sent to your email' });
  } catch (error) { res.status(500).json({ message: 'Server Error' }); }
});

router.post('/verify-forgot-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user || String(user.otp).trim() !== String(otp).trim() || user.otpExpires < Date.now()) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }
        res.json({ message: 'OTP Verified' });
    } catch (error) { res.status(500).json({ message: 'Server Error' }); }
});

router.post('/reset-password', async (req, res) => {
    try {
        const { email, otp, password } = req.body;
        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user || String(user.otp).trim() !== String(otp).trim() || user.otpExpires < Date.now()) return res.status(400).json({ message: 'Session expired' });
        
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.otp = undefined; user.otpExpires = undefined;
        await user.save();
        res.json({ message: 'Password reset successful' });
    } catch (error) { res.status(500).json({ message: 'Server Error' }); }
});

router.post('/logout', (req, res) => {
    res.clearCookie('refreshToken');
    res.status(200).json({ message: 'Logged out' });
});

router.get('/profile', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No Token' });
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      res.json(user);
    } catch (error) { res.status(500).json({ message: 'Invalid Token' }); }
});

router.post('/save-address', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No Token' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        user.addresses.push(req.body.address);
        await user.save();
        res.json({ id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin, addresses: user.addresses });
    } catch (error) { res.status(500).json({ message: 'Error saving address' }); }
});

module.exports = router;