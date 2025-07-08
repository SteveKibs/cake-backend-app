// Reference Directory: /src/routes/distributorSales.routes.js
const express = require('express');
const {
    createDistributorSale,
    getDistributorSales,
    getDistributorSaleById,
    updateDistributorSale,
    deleteDistributorSale
} = require('../controllers/distributorSales.controller');
const validate = require('../middleware/validation.middleware');
const {
    createDistributorSaleSchema,
    updateDistributorSaleSchema,
    getDistributorSaleByIdSchema,
    getDistributorSalesSchema
} = require('../validations/distributorSales.validation');

const router = express.Router();

router.post('/', validate({ body: createDistributorSaleSchema }), createDistributorSale);
router.get('/', validate({ query: getDistributorSalesSchema }), getDistributorSales);
router.get('/:id', validate({ params: getDistributorSaleByIdSchema }), getDistributorSaleById);
router.put('/:id', validate({ params: getDistributorSaleByIdSchema, body: updateDistributorSaleSchema }), updateDistributorSale);
router.delete('/:id', validate({ params: getDistributorSaleByIdSchema }), deleteDistributorSale);

module.exports = router;