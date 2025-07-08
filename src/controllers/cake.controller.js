// src/controllers/cake.controller.js
const Cake = require('../models/cake.model'); // Import the Cake model

// Create a new cake
const createCake = async (req, res) => {
    try {
        const { name, description, price, image_url, bogo_eligible } = req.body;
        console.log({ name, description, price, image_url, bogo_eligible })
        const newCake = await Cake.create(name, description, price, image_url, bogo_eligible);
        res.status(201).json(newCake); // 201 Created
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all cakes
const getCakes = async (req, res) => {
    try {
        const cakes = await Cake.findAll();
        res.status(200).json(cakes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single cake by ID
const getCakeById = async (req, res) => {
    try {
        const { id } = req.params; // Get ID from URL parameters
        const cake = await Cake.findById(id);
        if (!cake) {
            return res.status(404).json({ message: 'Cake not found' });
        }
        res.status(200).json(cake);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update an existing cake
const updateCake = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, image_url, bogo_eligible, is_available } = req.body;
        const updatedCake = await Cake.update(id, name, description, price, image_url, bogo_eligible, is_available);
        if (!updatedCake) {
            return res.status(404).json({ message: 'Cake not found' });
        }
        res.status(200).json(updatedCake);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete a cake
const deleteCake = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedCake = await Cake.delete(id);
        if (!deletedCake) {
            return res.status(404).json({ message: 'Cake not found' });
        }
        res.status(200).json({ message: 'Cake deleted successfully', cake: deletedCake });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createCake,
    getCakes,
    getCakeById,
    updateCake,
    deleteCake
};