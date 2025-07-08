// src/validations/stopover.validation.js
const Joi = require('joi');

const createStopoverSchema = Joi.object({
    route_id: Joi.number().integer().min(1).required(),
    name: Joi.string().min(2).max(255).required(),
    sequence_order: Joi.number().integer().min(0).required()
});

const updateStopoverSchema = Joi.object({
    name: Joi.string().min(2).max(255).optional(),
    sequence_order: Joi.number().integer().min(0).optional()
}).min(1);

const updateStopoverStatusSchema = Joi.object({
    status: Joi.string().valid('Pending', 'Arrived', 'Departed', 'Skipped').required()
});

const getStopoverByIdSchema = Joi.object({
    id: Joi.number().integer().min(1).required()
});

const getStopoversSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().valid('name', 'sequence_order', 'status', 'created_at', 'updated_at').default('sequence_order'),
    sortOrder: Joi.string().valid('asc', 'desc').default('asc'),
    routeId: Joi.number().integer().min(1).optional(),
    status: Joi.string().valid('Pending', 'Arrived', 'Departed', 'Skipped').optional(),
    search: Joi.string().max(255).allow('').optional()
});

module.exports = {
    createStopoverSchema,
    updateStopoverSchema,
    updateStopoverStatusSchema,
    getStopoverByIdSchema,
    getStopoversSchema
};