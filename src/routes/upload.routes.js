// Reference Directory: /src/routes/upload.routes.js

const express = require('express');
const upload = require('../utils/s3Upload'); // Our S3 upload middleware
const { uploadImage } = require('../controllers/upload.controller');
const { authenticateToken, authorizeRole } = require('../middleware/auth.middleware'); // For protection

const router = express.Router();

// Route for image upload
// This route will be protected, likely by admin or authenticated users who can manage cakes
router.post(
  '/image',
  authenticateToken, // Ensure only authenticated users can upload
  authorizeRole(['admin']), // Only admins can upload (or adjust based on who should manage cakes)
  upload.single('cakeImage'), // 'cakeImage' is the name of the form field that carries the file
  uploadImage // After multer processes, this controller sends the response
);

module.exports = router;