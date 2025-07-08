// src/controllers/flavor.controller.js
const Flavor = require('../models/flavor.model');

// Create a new flavor
const createFlavor = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Flavor name is required.' });
        }
        const newFlavor = await Flavor.create(name);
        res.status(201).json(newFlavor);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all flavors
const getFlavors = async (req, res, next) => { // Add 'next'
    try {
        const { page, limit, sortBy, sortOrder, search } = req.query; // Extract query params
        const options = { page, limit, sortBy, sortOrder, search };

        const result = await Flavor.findAll(options);
        res.status(200).json(result);
    } catch (error) {
        next(new ApiError(500, error.message));
    }
};

// Get a single flavor by ID
const getFlavorById = async (req, res) => {
    try {
        const { id } = req.params;
        const flavor = await Flavor.findById(id);
        if (!flavor) {
            return res.status(404).json({ message: 'Flavor not found' });
        }
        res.status(200).json(flavor);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update an existing flavor
const updateFlavor = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Flavor name is required.' });
        }
        const updatedFlavor = await Flavor.update(id, name);
        if (!updatedFlavor) {
            return res.status(404).json({ message: 'Flavor not found' });
        }
        res.status(200).json(updatedFlavor);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete a flavor
const deleteFlavor = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedFlavor = await Flavor.delete(id);
        if (!deletedFlavor) {
            return res.status(404).json({ message: 'Flavor not found' });
        }
        res.status(200).json({ message: 'Flavor deleted successfully', flavor: deletedFlavor });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createFlavor,
    getFlavors,
    getFlavorById,
    updateFlavor,
    deleteFlavor
};