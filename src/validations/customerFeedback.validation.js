// Reference Directory: /src/validations/customerFeedback.validation.js
const Joi = require('joi');

const createFeedbackSchema = Joi.object({
    customer_name: Joi.string().max(255).allow('').optional(),
    customer_contact: Joi.string().max(255).allow('').optional(),
    feedback_text: Joi.string().min(10).required(),
    rating: Joi.number().integer().min(1).max(5).optional().allow(null)
});

const updateFeedbackSchema = Joi.object({
    resolved: Joi.boolean().optional(),
    notes: Joi.string().max(1000).allow('').optional()
}).min(1); // At least one field required for update

const getFeedbackByIdSchema = Joi.object({
    id: Joi.number().integer().min(1).required()
});

const getFeedbackSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().valid('feedback_date', 'rating', 'customer_name', 'resolved').default('feedback_date'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
    resolved: Joi.boolean().optional(), // Filter by resolved status
    rating: Joi.number().integer().min(1).max(5).optional(), // Filter by rating
    search: Joi.string().max(255).allow('').optional() // Search by customer name or feedback text
});

module.exports = {
    createFeedbackSchema,
    updateFeedbackSchema,
    getFeedbackByIdSchema,
    getFeedbackSchema
};