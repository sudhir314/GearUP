const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  // FIXED: Renamed _id to product to prevent ID collision
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
  totalPrice: {
    type: Number,
    required: true,
    default: 0.0,
  },
  isPaid: {
    type: Boolean,
    default: true, 
  },
  paidAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    default: 'Processing', // Processing, Shipped, Delivered
  },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);