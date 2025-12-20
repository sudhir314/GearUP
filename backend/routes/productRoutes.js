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
    res.status(500).json({ message: 'Server Error Fetching Products' });
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
    res.status(500).json({ message: 'Server Error' });
  }
});

// CREATE PRODUCT (This is where your 500 error was happening)
router.post('/', protect, admin, async (req, res) => {
  try {
    const { name, price, description, category, countInStock, image } = req.body;

    // 1. Basic Validation
    if (!name || !price || !category) {
        return res.status(400).json({ message: 'Please add all required fields' });
    }

    let imageUrl = "https://via.placeholder.com/150"; // Default image if none provided

    // 2. Handle Image Upload (Cloudinary)
    // Checks if 'image' is a Base64 string (which AdminDashboard usually sends)
    if (image) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(image, {
          folder: 'gearup_products',
        });
        imageUrl = uploadResponse.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary Upload Error:", uploadError);
        // We continue even if image fails, to avoid 500 Crash, but log it.
        // You could return res.status(500) here if image is strictly required.
      }
    }

    // 3. Create Product in DB
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
    res.status(201).json(createdProduct);

  } catch (error) {
    console.error("Create Product Error:", error);
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
});

// UPDATE PRODUCT
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const { name, price, description, image, category, countInStock } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name || product.name;
      product.price = price || product.price;
      product.description = description || product.description;
      product.category = category || product.category;
      product.countInStock = countInStock || product.countInStock;

      if (image) {
         try {
            const uploadResponse = await cloudinary.uploader.upload(image, {
               folder: 'gearup_products',
            });
            product.image = uploadResponse.secure_url;
         } catch (e) {
            console.error("Image Update Error:", e);
         }
      }

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error Updating Product' });
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