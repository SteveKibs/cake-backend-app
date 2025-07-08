// src/validations/cake.validation.js
const Joi = require('joi');

const createCakeSchema = Joi.object({
    name: Joi.string().min(3).max(255).required(),
    description: Joi.string().max(1000).allow('').optional(),
    price: Joi.number().precision(2).min(0.01).required(),
    image_url: Joi.string().uri().max(255).allow('').optional(),
    bogo_eligible: Joi.boolean().default(false),
    is_available: Joi.boolean().default(true)
});

const updateCakeSchema = Joi.object({
    name: Joi.string().min(3).max(255).optional(),
    description: Joi.string().max(1000).allow('').optional(),
    price: Joi.number().precision(2).min(0.01).optional(),
    image_url: Joi.string().uri().max(255).allow('').optional(),
    bogo_eligible: Joi.boolean().optional(),
    is_available: Joi.boolean().optional()
}).min(1);

const getCakeByIdSchema = Joi.object({
    id: Joi.number().integer().min(1).required()
});

const getCakesSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().valid('name', 'price', 'created_at', 'updated_at').default('name'),
    sortOrder: Joi.string().valid('asc', 'desc').default('asc'),
    bogoEligible: Joi.boolean().optional(),
    isAvailable: Joi.boolean().optional(),
    search: Joi.string().max(255).allow('').optional(),
});

module.exports = {
    createCakeSchema,
    updateCakeSchema,
    getCakeByIdSchema,
    getCakesSchema
};