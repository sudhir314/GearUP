const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product'); // Import Product model
const { protect, admin } = require('../middleware/authMiddleware');

// Create Order (Secure Calculation)
router.post('/', protect, async (req, res) => {
  const { items, shippingAddress } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'No order items' });
  }

  try {
    // 1. Recalculate Total Price on Server Side
    let calculatedTotal = 0;
    const orderItems = [];

    for (const item of items) {
        const product = await Product.findById(item.product);
        if (!product) {
            return res.status(404).json({ message: `Product not found: ${item.name}` });
        }
        
        // Use price from DB, not from frontend
        calculatedTotal += product.price * item.quantity;
        
        orderItems.push({
            product: product._id,
            name: product.name,
            price: product.price,
            quantity: item.quantity
        });
    }

    // 2. Create Order
    const order = new Order({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      totalPrice: calculatedTotal, 
      status: 'Processing',
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating order' });
  }
});

// Get User Orders
router.get('/myorders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// ADMIN: Get All Orders
router.get('/all-orders', protect, admin, async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'id name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching all orders' });
  }
});

// ADMIN: Update Status
router.put('/:id/status', protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.status = req.body.status || order.status;
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Update failed' });
  }
});

module.exports = router;