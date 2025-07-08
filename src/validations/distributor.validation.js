// src/validations/distributor.validation.js
const Joi = require('joi');

const createDistributorSchema = Joi.object({
    name: Joi.string().min(3).max(255).required(),
    contact_person: Joi.string().min(3).max(255).optional().allow(''),
    phone_number: Joi.string().pattern(/^[0-9]{10,15}$/).required(), // Basic phone number pattern
    email: Joi.string().email().optional().allow(''),
    region: Joi.string().min(2).max(100).required(),
    commission_rate: Joi.number().precision(2).min(0).max(100).default(0.00) // Percentage from 0 to 100
});

const updateDistributorSchema = Joi.object({
    name: Joi.string().min(3).max(255).optional(),
    contact_person: Joi.string().min(3).max(255).optional().allow(''),
    phone_number: Joi.string().pattern(/^[0-9]{10,15}$/).optional(),
    email: Joi.string().email().optional().allow(''),
    region: Joi.string().min(2).max(100).optional(),
    commission_rate: Joi.number().precision(2).min(0).max(100).optional()
}).min(1); // At least one field required for update

const getDistributorByIdSchema = Joi.object({
    id: Joi.number().integer().min(1).required()
});

// Schema for fetching multiple distributors with pagination, filtering, sorting
const getDistributorsSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().valid('name', 'region', 'commission_rate', 'created_at', 'updated_at').default('name'),
    sortOrder: Joi.string().valid('asc', 'desc').default('asc'),
    region: Joi.string().max(100).allow('').optional(), // Filter by region
    search: Joi.string().max(255).allow('').optional() // Search by name, contact_person, phone_number, email
});

module.exports = {
    createDistributorSchema,
    updateDistributorSchema,
    getDistributorByIdSchema,
    getDistributorsSchema
};