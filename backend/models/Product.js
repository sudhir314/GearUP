const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  
  // --- UPDATED: Support Multiple Images ---
  image: { type: String }, // Keeps the main image (Backward Compatibility)
  images: [{ type: String }], // Array to store all images
  // ----------------------------------------

  category: { type: String, required: true },
  
  brand: { type: String },
  compatibility: { type: String },
  color: { type: String },
  material: { type: String },

  tag: { type: String },
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  description: { type: String },
  isAvailable: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);