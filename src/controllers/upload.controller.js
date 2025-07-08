// Reference Directory: /src/controllers/upload.controller.js

const ApiError = require('../utils/ApiError');

// This controller function is called AFTER multer has processed the upload
// If multer S3 was successful, file.location will contain the S3 URL
const uploadImage = (req, res, next) => {
    try {
        if (!req.file) {
            // This would typically be caught by multer's fileFilter or limits
            return next(new ApiError(400, 'No file uploaded.'));
        }

        // req.file is populated by multer-s3 middleware
        // req.file.location contains the S3 URL of the uploaded image
        res.status(200).json({
            message: 'Image uploaded successfully.',
            imageUrl: req.file.location // This is the S3 public URL
        });
    } catch (error) {
        console.error('Error in uploadImage controller:', error.message);
        next(new ApiError(500, error.message));
    }
};

module.exports = {
    uploadImage
};