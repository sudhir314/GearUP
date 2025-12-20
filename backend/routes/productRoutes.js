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
    res.status(500).json({ message: 'Error fetching products' });
  }
});

// GET SINGLE PRODUCT
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product' });
  }
});

// CREATE PRODUCT (This is where the 500 error happens)
router.post('/', protect, admin, async (req, res) => {
  try {
    console.log("Create Product Request Received"); // Debug Log

    const { name, price, description, category, countInStock, image } = req.body;

    // 1. Validation
    if (!name || !price || !category) {
        return res.status(400).json({ message: 'Please add Name, Price, and Category' });
    }

    let imageUrl = "https://via.placeholder.com/150";

    // 2. Image Upload
    if (image) {
      try {
        console.log("Attempting Cloudinary Upload..."); // Debug Log
        const uploadResponse = await cloudinary.uploader.upload(image, {
          folder: 'gearup_products',
        });
        imageUrl = uploadResponse.secure_url;
        console.log("Cloudinary Success:", imageUrl);
      } catch (uploadError) {
        console.error("Cloudinary Failed:", uploadError);
        // If Cloudinary fails, we return a 500 error with the specific reason
        return res.status(500).json({ 
            message: 'Image Upload Failed. Check Render Environment Variables.',
            error: uploadError.message 
        });
      }
    }

    // 3. Save to DB
    const product = new Product({
      user: req.user._id,
      name,
      price,
      description,
      image: imageUrl,
      category,
      countInStock: countInStock || 0,
    });

    const createdProduct = await product.save();
    console.log("Product Saved Successfully");
    res.status(201).json(createdProduct);

  } catch (error) {
    console.error("General Create Error:", error);
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
    res.status(500).json({ message: 'Server Error Deleting Product' });
  }
});

module.exports = router;