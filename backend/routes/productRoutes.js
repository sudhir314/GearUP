const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/authMiddleware');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// --- 1. SETUP IMAGE UPLOAD STORAGE ---
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'gearup_products', // Folder name in Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});

const upload = multer({ storage: storage });

// --- 2. GET ALL PRODUCTS (Public) ---
router.get('/', async (req, res) => {
  try {
    const keyword = req.query.keyword
      ? { name: { $regex: req.query.keyword, $options: 'i' } }
      : {};
      
    // Filter by category if provided
    const categoryQuery = req.query.category ? { category: req.query.category } : {};

    const products = await Product.find({ ...keyword, ...categoryQuery });
    res.json(products);
  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ message: 'Server Error fetching products' });
  }
});

// --- 3. GET SINGLE PRODUCT (Public) ---
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// --- 4. CREATE PRODUCT (Admin Only) ---
// Note: 'image' matches the name used in frontend FormData
router.post('/', protect, admin, upload.single('image'), async (req, res) => {
  console.log("Create Product Request Recieved");
  console.log("Body:", req.body);
  console.log("File:", req.file);

  try {
    const { name, price, description, category, countInStock } = req.body;

    // VALIDATION: Check if image uploaded successfully
    if (!req.file) {
      return res.status(400).json({ message: 'Image upload failed. Please select a valid image file.' });
    }

    const product = new Product({
      name,
      price,
      description,
      category,
      countInStock,
      image: req.file.path, // Cloudinary URL
      user: req.user._id,
    });

    const createdProduct = await product.save();
    console.log("Product Created:", createdProduct);
    res.status(201).json(createdProduct);

  } catch (error) {
    console.error("Product Create Error:", error);
    // This catches the crash and sends a readable error
    res.status(500).json({ message: error.message || 'Product creation failed on server' });
  }
});

// --- 5. DELETE PRODUCT (Admin Only) ---
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      await product.deleteOne();
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;