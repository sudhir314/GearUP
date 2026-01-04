const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  
  // Images
  image: { type: String }, // Main/Fallback image
  images: [{ type: String }], // Multiple images array

  category: { type: String, required: true },
  brand: { type: String },
  compatibility: { type: String },
  color: { type: String },
  material: { type: String },
  tag: { type: String },
  
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  description: { type: String },
  
  isAvailable: { type: Boolean, default: true },
  
  // --- NEW FIELD: REQUIRED FOR STOCK MANAGEMENT ---
  countInStock: { type: Number, required: true, default: 0 } 
  // ------------------------------------------------
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);