const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  // Address Field for Checkout
  addresses: [{
       fullName: String,
       phone: String,
       email: String,
       address: String,
       city: String,
       pincode: String
  }]
}, { timestamps: true });

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// --- FIX: Removed 'next' parameter to prevent crash ---
userSchema.pre('save', async function () {
  // If password is NOT modified, we return immediately (Exit)
  if (!this.isModified('password')) {
    return;
  }
  // Otherwise, hash the password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('User', userSchema);