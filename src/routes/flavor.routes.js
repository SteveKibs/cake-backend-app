// src/routes/flavor.routes.js
const express = require('express');
const {
    createFlavor,
    getFlavors,
    getFlavorById,
    updateFlavor,
    deleteFlavor
} = require('../controllers/flavor.controller');
const validate = require('../middleware/validation.middleware');
const {
    createFlavorSchema,
    updateFlavorSchema,
    getFlavorByIdSchema,
    getFlavorsSchema // Import new schema
} = require('../validations/flavor.validation');

const router = express.Router();

router.post('/', validate({ body: createFlavorSchema }), createFlavor);
router.get('/', validate({ query: getFlavorsSchema }), getFlavors); // Apply query validation for getFlavors
router.get('/:id', validate({ params: getFlavorByIdSchema }), getFlavorById);
router.put('/:id', validate({ params: getFlavorByIdSchema, body: updateFlavorSchema }), updateFlavor);
router.delete('/:id', validate({ params: getFlavorByIdSchema }), deleteFlavor);

module.exports = router;