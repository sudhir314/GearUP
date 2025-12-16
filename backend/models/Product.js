const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  image: { type: String, required: true },
  category: { type: String, required: true }, // e.g., "Back Cover", "Charger", "Tempered Glass"
  
  // --- NEW FIELDS FOR MOBILE ACCESSORIES ---
  brand: { type: String },          // e.g., "Samsung", "Apple", "OnePlus"
  compatibility: { type: String },  // e.g., "iPhone 15 Pro", "Galaxy S24"
  color: { type: String },          // e.g., "Matte Black", "Transparent"
  material: { type: String },       // e.g., "Silicon", "Hard Plastic", "Leather"
  // ----------------------------------------

  tag: { type: String }, // e.g., "Best Seller", "New Arrival"
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  description: { type: String },
  isAvailable: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);