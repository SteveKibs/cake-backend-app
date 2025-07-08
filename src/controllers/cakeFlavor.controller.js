// src/controllers/cakeFlavor.controller.js
const CakeFlavor = require('../models/cakeFlavor.model');
const Cake = require('../models/cake.model'); // To validate cake existence
const Flavor = require('../models/flavor.model'); // To validate flavor existence

// Add a flavor to a specific cake
const addFlavorToCake = async (req, res) => {
    try {
        const { cake_id, flavor_id } = req.body;

        // Basic validation
        if (!cake_id || !flavor_id) {
            return res.status(400).json({ message: 'Both cake_id and flavor_id are required.' });
        }

        // Optional: Verify if cake and flavor actually exist
        const existingCake = await Cake.findById(cake_id);
        if (!existingCake) {
            return res.status(404).json({ message: `Cake with ID ${cake_id} not found.` });
        }
        const existingFlavor = await Flavor.findById(flavor_id);
        if (!existingFlavor) {
            return res.status(404).json({ message: `Flavor with ID ${flavor_id} not found.` });
        }

        const association = await CakeFlavor.addFlavorToCake(cake_id, flavor_id);

        if (!association) {
            // This means ON CONFLICT DO NOTHING was triggered
            return res.status(200).json({ message: 'Association already exists.' });
        }

        res.status(201).json({ message: 'Flavor added to cake successfully.', association });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Remove a flavor from a specific cake
const removeFlavorFromCake = async (req, res) => {
    try {
        const { cake_id, flavor_id } = req.params; // Get IDs from URL parameters
        const deletedAssociation = await CakeFlavor.removeFlavorFromCake(cake_id, flavor_id);
        if (!deletedAssociation) {
            return res.status(404).json({ message: 'Association not found.' });
        }
        res.status(200).json({ message: 'Flavor removed from cake successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all flavors associated with a specific cake
const getFlavorsForCake = async (req, res) => {
    try {
        const { cake_id } = req.params;
        const flavors = await CakeFlavor.getFlavorsForCake(cake_id);
        res.status(200).json(flavors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all cakes associated with a specific flavor (optional endpoint)
const getCakesForFlavor = async (req, res) => {
    try {
        const { flavor_id } = req.params;
        const cakes = await CakeFlavor.getCakesForFlavor(flavor_id);
        res.status(200).json(cakes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    addFlavorToCake,
    removeFlavorFromCake,
    getFlavorsForCake,
    getCakesForFlavor
};