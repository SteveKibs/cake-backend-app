// src/middleware/error.middleware.js
const ApiError = require('../utils/ApiError'); // Ensure ApiError.js is in src/utils/

const errorMiddleware = (err, req, res, next) => {
    // Log the error for debugging purposes (in production, use a dedicated logger)
    console.error(err);

    let error = err;

    // If it's not an instance of ApiError, wrap it in a generic 500 ApiError
    if (!(error instanceof ApiError)) {
        // Default to 500 Internal Server Error if no specific status is set
        const statusCode = error.statusCode || 500;
        // Use a generic message for unexpected errors in production for security
        const message = error.message || "Something went wrong";
        error = new ApiError(statusCode, message);
    }

    // Send the standardized error response
    res.status(error.statusCode).json({
        success: error.success, // Will be false for errors
        message: error.message,
        errors: error.errors, // Array of specific validation errors if available
        statusCode: error.statusCode,
        // Only send stack trace in development mode for debugging
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
};

module.exports = errorMiddleware;