// src/controllers/stopover.controller.js
const Stopover = require('../models/stopover.model');
const Route = require('../models/route.model');
const ApiError = require('../utils/ApiError');

const VALID_STATUSES = ["Pending", "Arrived", "Departed", "Skipped"];

// Create a new stopover
const createStopover = async (req, res) => {
    try {
        const { route_id, name, sequence_order } = req.body;

        if (!route_id || !name || sequence_order === undefined) {
            return res.status(400).json({ message: 'Route ID, name, and sequence order are required.' });
        }

        // Optional: Validate if route_id exists
        const existingRoute = await Route.findById(route_id);
        if (!existingRoute) {
            return res.status(404).json({ message: `Route with ID ${route_id} not found.` });
        }

        const newStopover = await Stopover.create(route_id, name, sequence_order);
        res.status(201).json(newStopover);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all stopovers (now with pagination, filtering, sorting)
const getStopovers = async (req, res, next) => {
    try {
        const { page, limit, sortBy, sortOrder, routeId, status, search } = req.query; // Extract query params
        const options = { page, limit, sortBy, sortOrder, routeId, status, search };

        const result = await Stopover.findAll(options);
        res.status(200).json(result);
    } catch (error) {
        next(new ApiError(500, error.message));
    }
};

// Get a single stopover by ID
const getStopoverById = async (req, res) => {
    try {
        const { id } = req.params;
        const stopover = await Stopover.findById(id);
        if (!stopover) {
            return res.status(404).json({ message: 'Stopover not found' });
        }
        res.status(200).json(stopover);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update an existing stopover (details like name, sequence_order)
const updateStopover = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, sequence_order } = req.body; // route_id cannot be changed here

        if (!name || sequence_order === undefined) {
            return res.status(400).json({ message: 'Stopover name and sequence order are required.' });
        }

        const updatedStopover = await Stopover.update(id, name, sequence_order);
        if (!updatedStopover) {
            return res.status(404).json({ message: 'Stopover not found' });
        }
        res.status(200).json(updatedStopover);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update the status of a stopover
const updateStopoverStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status || !VALID_STATUSES.includes(status)) {
            return res.status(400).json({ message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}.` });
        }

        const updatedStopover = await Stopover.updateStatus(id, status);
        if (!updatedStopover) {
            return res.status(404).json({ message: 'Stopover not found' });
        }
        res.status(200).json(updatedStopover);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete a stopover
const deleteStopover = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedStopover = await Stopover.delete(id);
        if (!deletedStopover) {
            return res.status(404).json({ message: 'Stopover not found' });
        }
        res.status(200).json({ message: 'Stopover deleted successfully', stopover: deletedStopover });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createStopover,
    getStopovers,
    getStopoverById,
    updateStopover,
    updateStopoverStatus,
    deleteStopover
};