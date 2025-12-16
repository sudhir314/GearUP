const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  fullName: String,
  phone: String,
  email: String,
  address: String,
  city: String,
  pincode: String
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  // SECURITY UPDATE: Password is not required initially (during OTP step)
  password: { type: String }, 
  isAdmin: { type: Boolean, default: false },
  addresses: [addressSchema],
  
  // Verification Fields
  isVerified: { type: Boolean, default: false },
  otp: { type: String }, 
  otpExpires: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);