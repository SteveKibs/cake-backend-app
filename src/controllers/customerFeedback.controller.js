// Reference Directory: /src/controllers/customerFeedback.controller.js
const CustomerFeedback = require('../models/customerFeedback.model');
const ApiError = require('../utils/ApiError');

const createFeedback = async (req, res, next) => {
    try {
        const { customer_name, customer_contact, feedback_text, rating } = req.body;
        const newFeedback = await CustomerFeedback.create(customer_name, customer_contact, feedback_text, rating);
        res.status(201).json(newFeedback);
    } catch (error) {
        next(new ApiError(500, error.message));
    }
};

const getFeedback = async (req, res, next) => {
    try {
        const { page, limit, sortBy, sortOrder, resolved, rating, search } = req.query;
        const options = { page, limit, sortBy, sortOrder, resolved, rating, search };
        const result = await CustomerFeedback.findAll(options);
        res.status(200).json(result);
    } catch (error) {
        next(new ApiError(500, error.message));
    }
};

const getFeedbackById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const feedback = await CustomerFeedback.findById(id);
        if (!feedback) {
            return next(new ApiError(404, 'Feedback not found.'));
        }
        res.status(200).json(feedback);
    } catch (error) {
        next(new ApiError(500, error.message));
    }
};

const updateFeedback = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const updatedFeedback = await CustomerFeedback.update(id, updates);
        if (!updatedFeedback) {
            return next(new ApiError(404, 'Feedback not found or no changes provided.'));
        }
        res.status(200).json(updatedFeedback);
    } catch (error) {
        next(new ApiError(500, error.message));
    }
};

const deleteFeedback = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deletedFeedback = await CustomerFeedback.delete(id);
        if (!deletedFeedback) {
            return next(new ApiError(404, 'Feedback not found.'));
        }
        res.status(200).json({ message: 'Feedback deleted successfully.', feedback: deletedFeedback });
    } catch (error) {
        next(new ApiError(500, error.message));
    }
};

module.exports = {
    createFeedback,
    getFeedback,
    getFeedbackById,
    updateFeedback,
    deleteFeedback
};