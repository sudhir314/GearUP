const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');

dotenv.config();

const app = express();

// --- 1. SECURITY CONFIGURATION (CORS) ---
// This allows your Frontend to talk to this Backend
const allowedOrigins = [
    'http://localhost:3000', 
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    process.env.CLIENT_URL // <--- This will be your new Render Frontend URL
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            // If the specific origin isn't found, check if it matches the CLIENT_URL env var strictly
            if (origin === process.env.CLIENT_URL) {
                return callback(null, true);
            }
            // Optional: You can uncomment the line below to block unknown sources for high security
            // return callback(new Error('CORS policy violation'), false);
        }
        return callback(null, true);
    },
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

// Health Check Route (For Render)
app.get('/', (req, res) => {
    res.send('GearUp Backend is Running!');
});

// --- 5. START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));