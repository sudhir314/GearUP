const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');

dotenv.config();

const app = express();

// --- 1. SECURITY CONFIGURATION (CORS) ---
app.use(cors({
    origin: [
        'http://localhost:3000', 
        'http://127.0.0.1:3000',
        'https://sudhir314.github.io', 
        // Allow HTTPS (Secure)
        'https://www.solvewithsudhir.in',
        'https://solvewithsudhir.in',
        // Allow HTTP (Insecure - Needed while DNS propagates)
        'http://www.solvewithsudhir.in',
        'http://solvewithsudhir.in',
        process.env.CLIENT_URL
    ].filter(Boolean), 
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// --- 2. MIDDLEWARE ---
app.use(express.json()); 
app.use(cookieParser()); 

// --- 3. DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.log("MongoDB Connection Error:", err));

// --- 4. ROUTES ---
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/productRoutes'); 
const orderRoutes = require('./routes/orderRoutes');     
const couponRoutes = require('./routes/couponRoutes'); 
const adminRoutes = require('./routes/adminRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/admin', adminRoutes);

// --- 5. START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));