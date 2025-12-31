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

// CREATE PRODUCT (Supports Multiple Images)
router.post('/', protect, admin, async (req, res) => {
  try {
    console.log("Create Product Request Received"); 

    // Accept 'images' array from frontend
    const { name, price, description, category, countInStock, images, brand, compatibility, color, material, tag, isAvailable, originalPrice } = req.body;

    if (!name || !price || !category) {
        return res.status(400).json({ message: 'Please add Name, Price, and Category' });
    }

    let uploadedImageUrls = [];

    // --- NEW: Upload Multiple Images ---
    if (images && images.length > 0) {
      try {
        console.log(`Uploading ${images.length} images...`);
        
        // Upload all images in parallel
        const uploadPromises = images.map(imgStr => 
            cloudinary.uploader.upload(imgStr, { folder: 'gearup_products' })
        );
        
        const uploadResults = await Promise.all(uploadPromises);
        uploadedImageUrls = uploadResults.map(res => res.secure_url);
        
        console.log("Images uploaded:", uploadedImageUrls);
      } catch (uploadError) {
        console.error("Cloudinary Failed:", uploadError);
        return res.status(500).json({ 
            message: 'Image Upload Failed',
            error: uploadError.message 
        });
      }
    } else {
        // Fallback placeholder
        uploadedImageUrls = ["https://via.placeholder.com/150"];
    }

    const product = new Product({
      user: req.user._id,
      name,
      price,
      originalPrice,
      description,
      
      // Save Array AND Main Image (First one)
      images: uploadedImageUrls,
      image: uploadedImageUrls[0], 
      
      category,
      brand, compatibility, color, material, tag,
      isAvailable,
      countInStock: countInStock || 0,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);

  } catch (error) {
    console.error("Create Error:", error);
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
});

// UPDATE PRODUCT (Also supports multiple images)
router.put('/:id', protect, admin, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        const { name, price, description, category, images, brand, compatibility, color, material, tag, isAvailable, originalPrice } = req.body;

        product.name = name || product.name;
        product.price = price || product.price;
        product.originalPrice = originalPrice || product.originalPrice;
        product.description = description || product.description;
        product.category = category || product.category;
        product.brand = brand || product.brand;
        product.compatibility = compatibility || product.compatibility;
        product.color = color || product.color;
        product.material = material || product.material;
        product.tag = tag || product.tag;
        product.isAvailable = isAvailable !== undefined ? isAvailable : product.isAvailable;

        // Only update images if new ones are provided
        if (images && images.length > 0) {
            // Check if these are new Base64 strings or existing URLs
            // Simple check: if it starts with 'data:', it's new.
            let newUrls = [];
            
            for(let img of images) {
                if(img.startsWith('data:')) {
                    const uploadRes = await cloudinary.uploader.upload(img, { folder: 'gearup_products' });
                    newUrls.push(uploadRes.secure_url);
                } else {
                    newUrls.push(img); // Existing URL
                }
            }
            product.images = newUrls;
            product.image = newUrls[0];
        }

        const updatedProduct = await product.save();
        res.json(updatedProduct);

    } catch (error) {
        res.status(500).json({ message: 'Update failed', error: error.message });
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