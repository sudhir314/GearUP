const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary using environment variables defined in .env
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer storage to upload files directly to Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'phitku_ecommerce_products', // This is the folder where images will be saved in Cloudinary
        allowed_formats: ['jpeg', 'png', 'jpg'],
        // Optional: Define automatic image resizing for consistency
        transformation: [{ width: 800, height: 800, crop: "limit" }] 
    },
});

// Multer middleware instance ready to handle single file uploads
const upload = multer({ storage: storage });

module.exports = { cloudinary, upload };