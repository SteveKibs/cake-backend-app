// src/validations/order.validation.js
const Joi = require('joi');

const createOrderSchema = Joi.object({
    customer_name: Joi.string().min(2).max(255).required(),
    customer_phone: Joi.string().min(5).max(50).required(),
    customer_email: Joi.string().email().optional().allow(''),
    items: Joi.array().items(Joi.object({
        cake_id: Joi.number().integer().min(1).required(),
        quantity: Joi.number().integer().min(1).required()
    })).min(1).required(),
    route_id: Joi.number().integer().min(1).optional().allow(null),
    stopover_id: Joi.number().integer().min(1).optional().allow(null),
    notes: Joi.string().max(1000).optional().allow('')
});

const updateOrderStatusSchema = Joi.object({
    status: Joi.string().valid('Pending', 'Confirmed', 'Processing', 'Delivered', 'Cancelled').required()
});

const getOrderIdSchema = Joi.object({
    id: Joi.number().integer().min(1).required()
});

const getOrdersSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().valid('order_date', 'total_cost', 'customer_name', 'status').default('order_date'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
    status: Joi.string().valid('Pending', 'Confirmed', 'Processing', 'Delivered', 'Cancelled').optional(),
    customerName: Joi.string().max(255).allow('').optional(),
    customerPhone: Joi.string().max(50).allow('').optional(),
    deliveryDate: Joi.date().iso().optional()
});

module.exports = {
    createOrderSchema,
    updateOrderStatusSchema,
    getOrderIdSchema,
    getOrdersSchema
};