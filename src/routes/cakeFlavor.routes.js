// src/routes/cakeFlavor.routes.js
const express = require('express');
const {
    addFlavorToCake,
    removeFlavorFromCake,
    getFlavorsForCake,
    getCakesForFlavor
} = require('../controllers/cakeFlavor.controller');

const router = express.Router();

// Define API routes for cake-flavor associations
// POST /api/cake-flavors - Add a flavor to a cake
router.post('/', addFlavorToCake);

// DELETE /api/cake-flavors/:cake_id/:flavor_id - Remove a flavor from a cake
router.delete('/:cake_id/:flavor_id', removeFlavorFromCake);

// GET /api/cakes/:cake_id/flavors - Get all flavors for a specific cake
// (Note: This route is nested under /api/cakes for semantic clarity)
// We will integrate this particular route within the cakeRoutes file.
// For now, this file will handle the direct add/remove.

// GET /api/flavors/:flavor_id/cakes - Get all cakes for a specific flavor (optional)
router.get('/:flavor_id/cakes', getCakesForFlavor);


module.exports = router;