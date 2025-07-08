// src/controllers/route.controller.js

const Route = require('../models/route.model');
const Stopover = require('../models/stopover.model');
const ApiError = require('../utils/ApiError');

// Create a new route
const createRoute = async (req, res) => {
    try {
        const { name, delivery_date, is_active } = req.body;
        if (!name || !delivery_date) {
            return res.status(400).json({ message: 'Route name and delivery date are required.' });
        }
        const newRoute = await Route.create(name, delivery_date, is_active);
        res.status(201).json(newRoute);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all routes (now with pagination, filtering, and sorting)
const getRoutes = async (req, res, next) => {
    try {
        const { page, limit, sortBy, sortOrder, isActive, deliveryDate, search } = req.query;
        const options = { page, limit, sortBy, sortOrder, isActive, deliveryDate, search };

        const result = await Route.findAll(options); // This result already contains { data, meta }
        res.status(200).json(result); // Send the result directly
    } catch (error) {
        next(new ApiError(500, error.message));
    }
};

// Get a single route by ID
const getRouteById = async (req, res) => {
    try {
        const { id } = req.params;
        const route = await Route.findById(id);
        if (!route) {
            return res.status(404).json({ message: 'Route not found' });
        }
        res.status(200).json(route);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update an existing route
const updateRoute = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, delivery_date, is_active } = req.body;
        if (!name || !delivery_date) {
            return res.status(400).json({ message: 'Route name and delivery date are required.' });
        }
        const updatedRoute = await Route.update(id, name, delivery_date, is_active);
        if (!updatedRoute) {
            return res.status(404).json({ message: 'Route not found' });
        }
        res.status(200).json(updatedRoute);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete a route
const deleteRoute = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedRoute = await Route.delete(id);
        if (!deletedRoute) {
            return res.status(404).json({ message: 'Route not found' });
        }
        res.status(200).json({ message: 'Route deleted successfully', route: deletedRoute });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get active routes for a specific date
const getActiveRoutesByDate = async (req, res) => {
    try {
        const { date } = req.query; // Expect date as query parameter, e.g., ?date=YYYY-MM-DD
        if (!date) {
            return res.status(400).json({ message: 'Date query parameter is required (YYYY-MM-DD).' });
        }
        // Validate date format if necessary, though PostgreSQL will handle valid date strings
        const routes = await Route.findActiveRoutesByDate(date);
        res.status(200).json(routes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all stopovers for a specific route
const getStopoversByRoute = async (req, res) => {
    try {
        const { route_id } = req.params; // Get route ID from URL parameters

        // Optional: Validate if route_id exists
        const existingRoute = await Route.findById(route_id);
        if (!existingRoute) {
            return res.status(404).json({ message: `Route with ID ${route_id} not found.` });
        }

        const stopovers = await Stopover.getByRouteId(route_id);
        res.status(200).json(stopovers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createRoute,
    getRoutes,
    getRouteById,
    updateRoute,
    deleteRoute,
    getActiveRoutesByDate,
    getStopoversByRoute
};