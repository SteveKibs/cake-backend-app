// src/validations/auth.validation.js
const Joi = require('joi');

const registerSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().min(6).required(),
    email: Joi.string().email().required(),
    role: Joi.string().valid('admin', 'driver').default('admin')
});

const loginSchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required()
});

// NEW: Schema for fetching multiple users with pagination, filtering, sorting
const getUsersSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().valid('username', 'email', 'role', 'created_at').default('username'),
    sortOrder: Joi.string().valid('asc', 'desc').default('asc'),
    role: Joi.string().valid('admin', 'driver', 'distributor').optional(), // Filter by role
    search: Joi.string().max(100).allow('').optional() // Search by username or email
});

// NEW: Schema for updating a user by an admin
const updateUserSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).optional(),
    email: Joi.string().email().optional(),
    role: Joi.string().valid('admin', 'driver', 'distributor').optional()
}).min(1); // At least one field is required for update

// NEW: Schema for user ID parameter
const getUserIdSchema = Joi.object({
    id: Joi.number().integer().min(1).required()
});

module.exports = {
    registerSchema,
    loginSchema,
    getUsersSchema,       // Export new schemas
    updateUserSchema,
    getUserIdSchema
};