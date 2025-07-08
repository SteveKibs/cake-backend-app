// src/validations/route.validation.js
const Joi = require('joi').extend(require('@joi/date')); // Remember to install @joi/date if you haven't (yarn add @joi/date)

const createRouteSchema = Joi.object({
    name: Joi.string().min(3).max(255).required(),
    delivery_date: Joi.date().format('YYYY-MM-DD').iso().required(),
    is_active: Joi.boolean().default(false)
});

const updateRouteSchema = Joi.object({
    name: Joi.string().min(3).max(255).optional(),
    delivery_date: Joi.date().format('YYYY-MM-DD').iso().optional(),
    is_active: Joi.boolean().optional()
}).min(1);

const getRouteByIdSchema = Joi.object({
    id: Joi.number().integer().min(1).required()
});

const getRoutesSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().valid('name', 'delivery_date', 'created_at', 'updated_at').default('delivery_date'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
    isActive: Joi.boolean().optional(),
    deliveryDate: Joi.date().format('YYYY-MM-DD').iso().optional(),
    search: Joi.string().max(255).allow('').optional()
});

const getActiveRoutesByDateSchema = Joi.object({
    date: Joi.date().format('YYYY-MM-DD').iso().required()
});

module.exports = {
    createRouteSchema,
    updateRouteSchema,
    getRouteByIdSchema,
    getRoutesSchema,
    getActiveRoutesByDateSchema
};