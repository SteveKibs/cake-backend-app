// Reference Directory: /src/routes/offers.routes.js
const express = require('express');
const {
    createOffer,
    getOffers,
    getOfferById,
    updateOffer,
    deleteOffer
} = require('../controllers/offers.controller');
const validate = require('../middleware/validation.middleware');
const {
    createOfferSchema,
    updateOfferSchema,
    getOfferByIdSchema,
    getOffersSchema
} = require('../validations/offer.validation');

const router = express.Router();

router.post('/', validate({ body: createOfferSchema }), createOffer);
router.get('/', validate({ query: getOffersSchema }), getOffers);
router.get('/:id', validate({ params: getOfferByIdSchema }), getOfferById);
router.put('/:id', validate({ params: getOfferByIdSchema, body: updateOfferSchema }), updateOffer);
router.delete('/:id', validate({ params: getOfferByIdSchema }), deleteOffer);

module.exports = router;