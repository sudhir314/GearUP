const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product'); 
const { protect, admin } = require('../middleware/authMiddleware');

// 1. CREATE ORDER (Customer)
router.post('/', protect, async (req, res) => {
  const { items, shippingAddress, paymentMethod } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'No order items' });
  } 
  
  try {
    // Calculate Total Price on Backend
    let calculatedTotal = 0;
    const orderItemsWithDetails = [];

    for (const item of items) {
        const productFromDb = await Product.findById(item.product);
        if (productFromDb) {
            const price = productFromDb.price;
            calculatedTotal += price * item.quantity;
            
            orderItemsWithDetails.push({
                product: productFromDb._id,
                name: productFromDb.name,
                price: price,
                quantity: item.quantity
            });
        }
    }

    // --- LOGIC FOR COD vs ONLINE ---
    const isCod = paymentMethod === 'COD'; // Check if user selected COD

    const order = new Order({
      items: orderItemsWithDetails, 
      user: req.user._id,
      shippingAddress,
      paymentMethod: paymentMethod || 'Online', 
      totalPrice: calculatedTotal,
      
      // If COD, isPaid = false. If Online, isPaid = true.
      isPaid: !isCod, 
      paidAt: isCod ? null : Date.now(),
      status: 'Processing'
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);

  } catch (error) {
    console.error("Create Order Error:", error);
    res.status(500).json({ message: 'Failed to create order', error: error.message });
  }
});

// 2. GET MY ORDERS (Customer)
router.get('/myorders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// 3. GET ALL ORDERS (Admin Only)
router.get('/all-orders', protect, admin, async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'id name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching all orders' });
  }
});

// 4. UPDATE ORDER STATUS (Admin Only)
router.put('/:id/status', protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.status = req.body.status || order.status;
      
      // If Admin marks as Delivered, and it was COD, mark it paid now
      if (req.body.status === 'Delivered') {
          order.isDelivered = true;
          order.deliveredAt = Date.now();
          if (order.paymentMethod === 'COD') {
              order.isPaid = true;
              order.paidAt = Date.now();
          }
      }
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating order' });
  }
});

module.exports = router;