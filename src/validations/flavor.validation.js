// src/validations/flavor.validation.js
const Joi = require('joi');

const createFlavorSchema = Joi.object({
    name: Joi.string().min(2).max(100).required()
});

const updateFlavorSchema = Joi.object({
    name: Joi.string().min(2).max(100).required()
});

const getFlavorByIdSchema = Joi.object({
    id: Joi.number().integer().min(1).required()
});

const getFlavorsSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().valid('name', 'created_at', 'updated_at').default('name'),
    sortOrder: Joi.string().valid('asc', 'desc').default('asc'),
    search: Joi.string().max(100).allow('').optional()
});

module.exports = {
    createFlavorSchema,
    updateFlavorSchema,
    getFlavorByIdSchema,
    getFlavorsSchema
};