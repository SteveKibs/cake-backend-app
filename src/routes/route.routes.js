// src/routes/route.routes.js
const express = require('express');
const {
    createRoute,
    getRoutes,
    getRouteById,
    updateRoute,
    deleteRoute,
    getActiveRoutesByDate,
    getStopoversByRoute
} = require('../controllers/route.controller');

const router = express.Router();

// Define API routes for routes
router.post('/', createRoute);              // POST /api/routes - Create a new route
router.get('/', getRoutes);                 // GET /api/routes - Get all routes
router.get('/active', getActiveRoutesByDate); // GET /api/routes/active?date=YYYY-MM-DD - Get active routes for a specific date
router.get('/:id', getRouteById);           // GET /api/routes/:id - Get a single route by ID
router.put('/:id', updateRoute);            // PUT /api/routes/:id - Update a route by ID
router.delete('/:id', deleteRoute);         // DELETE /api/routes/:id - Delete a route by ID
router.get('/:route_id/stopovers', getStopoversByRoute); // New route: Get all stopovers for a specific route

module.exports = router;