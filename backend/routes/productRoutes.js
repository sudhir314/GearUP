const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); // Import the new middleware

// 1. GET ALL PRODUCTS (With Pagination)
router.get('/', async (req, res) => {
  try {
    // If "page" is passed, use pagination. Otherwise return all (backward compatibility)
    if (req.query.page) {
        const pageSize = Number(req.query.limit) || 10;
        const page = Number(req.query.page) || 1;
        
        const count = await Product.countDocuments({});
        const products = await Product.find({})
          .sort({ createdAt: -1 })
          .limit(pageSize)
          .skip(pageSize * (page - 1));

        return res.json({ 
            products, 
            page, 
            pages: Math.ceil(count / pageSize),
            total: count 
        });
    } else {
        // Fallback for parts of the app not using pagination yet
        const products = await Product.find({}).sort({ createdAt: -1 });
        return res.json(products);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products' });
  }
});

// 2. GET SINGLE PRODUCT
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

// 3. CREATE PRODUCT (Multipart/Form-Data)
// Note: 'images' matches the field name in frontend FormData
router.post('/', protect, admin, upload.array('images', 10), async (req, res) => {
  try {
    console.log("Create Product Request via Multer"); 
    
    // Text fields are in req.body
    const { name, price, description, category, countInStock, brand, compatibility, color, material, tag, isAvailable, originalPrice } = req.body;

    // Image files are uploaded by Multer; URLs are in req.files
    let imagePaths = [];
    if (req.files && req.files.length > 0) {
        imagePaths = req.files.map(file => file.path); // Cloudinary URL
    } else {
        imagePaths = ["https://via.placeholder.com/150"];
    }

    const product = new Product({
      user: req.user._id,
      name,
      price: Number(price),
      originalPrice: Number(originalPrice),
      description,
      category,
      brand, compatibility, color, material, tag,
      isAvailable: isAvailable === 'true', // FormData sends booleans as strings
      countInStock: Number(countInStock) || 0,
      images: imagePaths,
      image: imagePaths[0] // Backward compatibility
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);

  } catch (error) {
    console.error("Create Error:", error);
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
});

// 4. UPDATE PRODUCT (Multipart/Form-Data)
router.put('/:id', protect, admin, upload.array('newImages', 10), async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        const { name, price, description, category, brand, compatibility, color, material, tag, isAvailable, originalPrice, existingImages } = req.body;

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
        
        if (isAvailable !== undefined) {
             product.isAvailable = isAvailable === 'true';
        }

        // Logic: Combine 'existingImages' (sent as string/array) + 'newImages' (uploaded files)
        let finalImages = [];
        
        // 1. Add existing images kept by user
        if (existingImages) {
            // FormData might send a single string or an array of strings
            const current = Array.isArray(existingImages) ? existingImages : [existingImages];
            finalImages = [...current];
        }

        // 2. Add newly uploaded images
        if (req.files && req.files.length > 0) {
            const newUrls = req.files.map(file => file.path);
            finalImages = [...finalImages, ...newUrls];
        }

        // Only update if we have a valid list, otherwise keep old
        if (finalImages.length > 0) {
            product.images = finalImages;
            product.image = finalImages[0];
        }

        const updatedProduct = await product.save();
        res.json(updatedProduct);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Update failed', error: error.message });
    }
});

// 5. DELETE PRODUCT
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