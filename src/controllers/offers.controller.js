// Reference Directory: /src/controllers/offers.controller.js
const Offer = require('../models/offers.model');
const ApiError = require('../utils/ApiError');

const createOffer = async (req, res, next) => {
    try {
        const { name, description, discount_type, discount_value, start_date, end_date, applicable_to_all_products, product_ids, is_active } = req.body;
        const newOffer = await Offer.create(name, description, discount_type, discount_value, start_date, end_date, applicable_to_all_products, product_ids, is_active);
        res.status(201).json(newOffer);
    } catch (error) {
        next(new ApiError(500, error.message));
    }
};

const getOffers = async (req, res, next) => {
    try {
        const { page, limit, sortBy, sortOrder, isActive, discountType, search } = req.query;
        const options = { page, limit, sortBy, sortOrder, isActive, discountType, search };
        const result = await Offer.findAll(options);
        res.status(200).json(result);
    } catch (error) {
        next(new ApiError(500, error.message));
    }
};

const getOfferById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const offer = await Offer.findById(id);
        if (!offer) {
            return next(new ApiError(404, 'Offer not found.'));
        }
        res.status(200).json(offer);
    } catch (error) {
        next(new ApiError(500, error.message));
    }
};

const updateOffer = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const updatedOffer = await Offer.update(id, updates);
        if (!updatedOffer) {
            return next(new ApiError(404, 'Offer not found or no changes provided.'));
        }
        res.status(200).json(updatedOffer);
    } catch (error) {
        next(new ApiError(500, error.message));
    }
};

const deleteOffer = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deletedOffer = await Offer.delete(id);
        if (!deletedOffer) {
            return next(new ApiError(404, 'Offer not found.'));
        }
        res.status(200).json({ message: 'Offer deleted successfully.', offer: deletedOffer });
    } catch (error) {
        next(new ApiError(500, error.message));
    }
};

module.exports = {
    createOffer,
    getOffers,
    getOfferById,
    updateOffer,
    deleteOffer
};