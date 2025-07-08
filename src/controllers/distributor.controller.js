// src/controllers/distributor.controller.js
const Distributor = require('../models/distributor.model');
const ApiError = require('../utils/ApiError');

// Create a new distributor
const createDistributor = async (req, res, next) => {
    try {
        const { name, contact_person, phone_number, email, region, commission_rate } = req.body;
        const newDistributor = await Distributor.create(name, contact_person, phone_number, email, region, commission_rate);
        res.status(201).json(newDistributor);
    } catch (error) {
        next(new ApiError(error.message.includes('already exists') ? 409 : 500, error.message));
    }
};

// Get all distributors with pagination, filtering, and sorting
const getDistributors = async (req, res, next) => {
    try {
        const { page, limit, sortBy, sortOrder, region, search } = req.query;
        const options = { page, limit, sortBy, sortOrder, region, search };
        const result = await Distributor.findAll(options);
        res.status(200).json(result);
    } catch (error) {
        next(new ApiError(500, error.message));
    }
};

// Get a single distributor by ID
const getDistributorById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const distributor = await Distributor.findById(id);
        if (!distributor) {
            return next(new ApiError(404, 'Distributor not found.'));
        }
        res.status(200).json(distributor);
    } catch (error) {
        next(new ApiError(500, error.message));
    }
};

// Update an existing distributor
const updateDistributor = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = req.body; // Joi validation ensures only allowed fields are here
        const updatedDistributor = await Distributor.update(id, updates);
        if (!updatedDistributor) {
            return next(new ApiError(404, 'Distributor not found or no changes provided.'));
        }
        res.status(200).json(updatedDistributor);
    } catch (error) {
        next(new ApiError(error.message.includes('already exists') ? 409 : 500, error.message));
    }
};

// Delete a distributor
const deleteDistributor = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deletedDistributor = await Distributor.delete(id);
        if (!deletedDistributor) {
            return next(new ApiError(404, 'Distributor not found.'));
        }
        res.status(200).json({ message: 'Distributor deleted successfully.', distributor: deletedDistributor });
    } catch (error) {
        next(new ApiError(error.message.includes('associated sales') ? 409 : 500, error.message)); // Use 409 Conflict for FK violation
    }
};

module.exports = {
    createDistributor,
    getDistributors,
    getDistributorById,
    updateDistributor,
    deleteDistributor
};