const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  otp: { 
    type: String, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now, 
    index: { expires: 300 } // OTP auto-deletes after 5 minutes
  }
});

module.exports = mongoose.model('Otp', otpSchema);