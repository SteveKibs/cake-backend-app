// Reference Directory: /src/validations/offer.validation.js
const Joi = require('joi').extend(require('@joi/date'));

const createOfferSchema = Joi.object({
    name: Joi.string().min(3).max(255).required(),
    description: Joi.string().max(1000).allow('').optional(),
    discount_type: Joi.string().valid('percentage', 'fixed_amount', 'BOGO').required(),
    discount_value: Joi.number().precision(2).min(0).required(),
    start_date: Joi.date().format('YYYY-MM-DD').iso().required(),
    end_date: Joi.date().format('YYYY-MM-DD').iso().min(Joi.ref('start_date')).required(), // end_date must be after start_date
    applicable_to_all_products: Joi.boolean().default(true),
    applicable_to_all_products: Joi.boolean().default(true),
    product_ids: Joi.string().pattern(/^(\d+,)*\d+$/).allow('').allow(null).optional().description('Comma-separated cake IDs if not applicable to all products'), // ADD .allow(null) HERE
    is_active: Joi.boolean().default(true)
});

const updateOfferSchema = Joi.object({
    name: Joi.string().min(3).max(255).optional(),
    description: Joi.string().max(1000).allow('').optional(),
    discount_type: Joi.string().valid('percentage', 'fixed_amount', 'BOGO').optional(),
    discount_value: Joi.number().precision(2).min(0).optional(),
    start_date: Joi.date().format('YYYY-MM-DD').iso().optional(),
    end_date: Joi.date().format('YYYY-MM-DD').iso().min(Joi.ref('start_date')).optional(),
    applicable_to_all_products: Joi.boolean().optional(),
    product_ids: Joi.string().pattern(/^(\d+,)*\d+$/).allow('').allow(null).optional(), // ADD .allow(null) HERE
    is_active: Joi.boolean().optional()
}).min(1);

const getOfferByIdSchema = Joi.object({
    id: Joi.number().integer().min(1).required()
});

const getOffersSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().valid('name', 'start_date', 'end_date', 'discount_value', 'is_active').default('start_date'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
    isActive: Joi.boolean().optional(),
    discountType: Joi.string().valid('percentage', 'fixed_amount', 'BOGO').optional(),
    search: Joi.string().max(255).allow('').optional() // Search by name or description
});

module.exports = {
    createOfferSchema,
    updateOfferSchema,
    getOfferByIdSchema,
    getOffersSchema
};