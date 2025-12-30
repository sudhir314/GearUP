const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');
const path = require('path');

// Load env vars
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Increase data limit for images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- CORS SETUP ---
const allowedOrigins = [
    "http://localhost:3000",          // Your Local Frontend
    "https://sudhir314.github.io"     // Your Live Frontend
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            return callback(new Error('CORS Policy Error'), false);
        }
        return callback(null, true);
    },
    credentials: true
}));

// --- ROUTE REGISTRATION ---
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes')); // Updated with Admin logic
app.use('/api/auth', require('./routes/auth'));

// ** NEW ADMIN & COUPON ROUTES (FIXES 404 ERRORS) **
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/coupons', require('./routes/couponRoutes'));

// Basic Route
app.get('/', (req, res) => {
    res.send('GearUp API is Running...');
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error("Global Error Handler:", err.stack);
    res.status(500).json({ 
        message: 'Internal Server Error', 
        error: err.message 
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});