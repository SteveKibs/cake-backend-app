// Reference Directory: /src/routes/stopover.routes.js

const express = require('express');
const {
    createStopover,
    getStopovers,
    getStopoverById,
    updateStopover,
    updateStopoverStatus,
    deleteStopover
} = require('../controllers/stopover.controller');
const validate = require('../middleware/validation.middleware');
const {
    createStopoverSchema,
    updateStopoverSchema,
    updateStopoverStatusSchema,
    getStopoverByIdSchema,
    getStopoversSchema
} = require('../validations/stopover.validation'); // Import new schemas

const router = express.Router();

router.post('/', validate({ body: createStopoverSchema }), createStopover);
router.get('/', validate({ query: getStopoversSchema }), getStopovers); // Apply query validation for getStopovers
router.get('/:id', validate({ params: getStopoverByIdSchema }), getStopoverById);
router.put('/:id', validate({ params: getStopoverByIdSchema, body: updateStopoverSchema }), updateStopover);
router.patch('/:id/status', validate({ params: getStopoverByIdSchema, body: updateStopoverStatusSchema }), updateStopoverStatus);
router.delete('/:id', validate({ params: getStopoverByIdSchema }), deleteStopover);

module.exports = router;