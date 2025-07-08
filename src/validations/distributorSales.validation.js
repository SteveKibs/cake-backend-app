// Reference Directory: /src/validations/distributorSales.validation.js
const Joi = require('joi').extend(require('@joi/date'));

const createDistributorSaleSchema = Joi.object({
    distributor_id: Joi.number().integer().min(1).required(),
    total_amount: Joi.number().precision(2).min(0.01).required(),
    commission_earned: Joi.number().precision(2).min(0).required(), // Can be calculated by backend
    product_details: Joi.array().items(Joi.object({ // Flexible JSONB for product details
        cake_id: Joi.number().integer().min(1).required(),
        quantity: Joi.number().integer().min(1).required(),
        price_at_sale: Joi.number().precision(2).min(0.01).required(),
        flavor: Joi.string().optional().allow('')
    })).optional(),
    notes: Joi.string().max(1000).allow('').optional(),
    payment_status: Joi.string().valid('pending', 'paid', 'refunded').default('pending')
});

const updateDistributorSaleSchema = Joi.object({
    total_amount: Joi.number().precision(2).min(0.01).optional(),
    commission_earned: Joi.number().precision(2).min(0).optional(),
    product_details: Joi.array().items(Joi.object({
        cake_id: Joi.number().integer().min(1).required(),
        quantity: Joi.number().integer().min(1).required(),
        price_at_sale: Joi.number().precision(2).min(0.01).required(),
        flavor: Joi.string().optional().allow('')
    })).optional(),
    notes: Joi.string().max(1000).allow('').optional(),
    payment_status: Joi.string().valid('pending', 'paid', 'refunded').optional()
}).min(1);

const getDistributorSaleByIdSchema = Joi.object({
    id: Joi.number().integer().min(1).required()
});

const getDistributorSalesSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().valid('sale_date', 'total_amount', 'commission_earned', 'distributor_id', 'payment_status').default('sale_date'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
    distributorId: Joi.number().integer().min(1).optional(),
    paymentStatus: Joi.string().valid('pending', 'paid', 'refunded').optional(),
    startDate: Joi.date().format('YYYY-MM-DD').iso().optional(),
    endDate: Joi.date().format('YYYY-MM-DD').iso().optional().min(Joi.ref('startDate')),
    search: Joi.string().max(255).allow('').optional() // Search notes
});

module.exports = {
    createDistributorSaleSchema,
    updateDistributorSaleSchema,
    getDistributorSaleByIdSchema,
    getDistributorSalesSchema
};