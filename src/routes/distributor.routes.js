// src/routes/distributor.routes.js
const express = require('express');
const {
    createDistributor,
    getDistributors,
    getDistributorById,
    updateDistributor,
    deleteDistributor
} = require('../controllers/distributor.controller');
const validate = require('../middleware/validation.middleware');
const {
    createDistributorSchema,
    updateDistributorSchema,
    getDistributorByIdSchema,
    getDistributorsSchema
} = require('../validations/distributor.validation');

const router = express.Router();

// Define API routes for distributors
router.post('/', validate({ body: createDistributorSchema }), createDistributor);                 // POST /api/distributors
router.get('/', validate({ query: getDistributorsSchema }), getDistributors);                     // GET /api/distributors
router.get('/:id', validate({ params: getDistributorByIdSchema }), getDistributorById);           // GET /api/distributors/:id
router.put('/:id', validate({ params: getDistributorByIdSchema, body: updateDistributorSchema }), updateDistributor); // PUT /api/distributors/:id
router.delete('/:id', validate({ params: getDistributorByIdSchema }), deleteDistributor);         // DELETE /api/distributors/:id

module.exports = router;