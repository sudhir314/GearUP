const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/authMiddleware');
const cloudinary = require('../config/cloudinary');

// GET ALL PRODUCTS
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// GET SINGLE PRODUCT
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) res.json(product);
    else res.status(404).json({ message: 'Product not found' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// CREATE PRODUCT (Fixed 500 Error)
router.post('/', protect, admin, async (req, res) => {
  try {
    // 1. Get data from Frontend
    const { name, price, description, category, countInStock, image } = req.body;

    // 2. Validate
    if (!name || !price || !category) {
      return res.status(400).json({ message: 'Name, Price and Category are required' });
    }

    let imageUrl = "";

    // 3. Upload Image (Safely)
    if (image) {
      try {
        const uploadedResponse = await cloudinary.uploader.upload(image, {
          folder: 'gearup_products'
        });
        imageUrl = uploadedResponse.secure_url;
      } catch (imgError) {
        console.error("Cloudinary Error:", imgError);
        // We continue without image rather than crashing the whole server
      }
    }

    // 4. Save to Database
    const product = new Product({
      user: req.user._id,
      name,
      price,
      description,
      category,
      countInStock,
      image: imageUrl
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);

  } catch (error) {
    console.error("Backend Error:", error);
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
});

// DELETE PRODUCT
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