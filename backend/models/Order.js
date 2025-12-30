const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, 
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  items: [orderItemSchema], 
  shippingAddress: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String, required: true }
  },
  // --- NEW FIELD ---
  paymentMethod: {
    type: String,
    required: true,
    default: 'Online' 
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0.0,
  },
  // --- CHANGED: Default is false now ---
  isPaid: {
    type: Boolean,
    default: false, 
  },
  paidAt: {
    type: Date,
  },
  status: {
    type: String,
    default: 'Processing',
  },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);