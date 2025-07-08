// src/routes/cake.routes.js
const express = require('express');
const {
    createCake,
    getCakes,
    getCakeById,
    updateCake,
    deleteCake
} = require('../controllers/cake.controller');
const { getFlavorsForCake } = require('../controllers/cakeFlavor.controller'); // Import controller for cake's flavors

const router = express.Router();

// Define API routes for cakes
router.post('/', createCake);
router.get('/', getCakes);
router.get('/:id', getCakeById);
router.put('/:id', updateCake);
router.delete('/:id', deleteCake);

// New route: Get all flavors for a specific cake
router.get('/:cake_id/flavors', getFlavorsForCake);

module.exports = router;