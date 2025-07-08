// src/middleware/validation.middleware.js
const Joi = require('joi');
const ApiError = require('../utils/ApiError'); // Our custom error class

/**
 * Middleware to validate request data against a Joi schema.
 * @param {Object} schema - Joi schema object (e.g., { body: Joi.object({ ... }) }).
 * @returns {Function} Express middleware function.
 */
const validate = (schema) => (req, res, next) => {
    const validationOptions = {
        abortEarly: false, // Include all errors, not just the first one
        allowUnknown: true, // Allow unknown keys (useful for PATCH, but be specific for POST/PUT)
        stripUnknown: true // Remove unknown keys (e.g., if a client sends extra fields)
    };

    // Compile a Joi schema from the provided schema object, then validate
    const { error, value } = Joi.compile(schema)
        .validate(
            {
                body: req.body,
                query: req.query,
                params: req.params
            },
            validationOptions
        );

    if (error) {
        // Map Joi errors to a more readable format
        const errors = error.details.map((detail) => ({
            field: detail.context.key,
            message: detail.message.replace(/['"]/g, '') // Remove quotes from messages
        }));
        return next(new ApiError(400, 'Validation Error', errors)); // Use 400 Bad Request
    }

    // Replace request properties with validated values (after stripping unknown fields)
    // This ensures your controllers work with clean, validated data.
    req.body = value.body || {};
    req.query = value.query || {};
    req.params = value.params || {};

    next();
};

module.exports = validate;