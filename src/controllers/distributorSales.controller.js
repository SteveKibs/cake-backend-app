// Reference Directory: /src/controllers/distributorSales.controller.js
const DistributorSales = require('../models/distributorSales.model');
const Distributor = require('../models/distributor.model'); // To validate distributor_id
const ApiError = require('../utils/ApiError');

const createDistributorSale = async (req, res, next) => {
    try {
        const { distributor_id, total_amount, product_details, notes, payment_status } = req.body;

        // Optional: Validate if distributor_id exists
        const existingDistributor = await Distributor.findById(distributor_id);
        if (!existingDistributor) {
            return next(new ApiError(404, `Distributor with ID ${distributor_id} not found.`));
        }

        // Calculate commission based on distributor's rate
        const commissionRate = parseFloat(existingDistributor.commission_rate) / 100; // Convert percentage to decimal
        const commissionEarned = total_amount * commissionRate;

        const newSale = await DistributorSales.create(
            distributor_id,
            total_amount,
            commissionEarned,
            product_details,
            notes,
            payment_status
        );
        res.status(201).json(newSale);
    } catch (error) {
        next(new ApiError(error.message.includes('Invalid distributor_id') ? 404 : 500, error.message));
    }
};

const getDistributorSales = async (req, res, next) => {
    try {
        const { page, limit, sortBy, sortOrder, distributorId, paymentStatus, startDate, endDate, search } = req.query;
        const options = { page, limit, sortBy, sortOrder, distributorId, paymentStatus, startDate, endDate, search };
        const result = await DistributorSales.findAll(options);
        res.status(200).json(result);
    } catch (error) {
        next(new ApiError(500, error.message));
    }
};

const getDistributorSaleById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const sale = await DistributorSales.findById(id);
        if (!sale) {
            return next(new ApiError(404, 'Distributor sale not found.'));
        }
        res.status(200).json(sale);
    } catch (error) {
        next(new ApiError(500, error.message));
    }
};

const updateDistributorSale = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const updatedSale = await DistributorSales.update(id, updates);
        if (!updatedSale) {
            return next(new ApiError(404, 'Distributor sale not found or no changes provided.'));
        }
        res.status(200).json(updatedSale);
    } catch (error) {
        next(new ApiError(500, error.message));
    }
};

const deleteDistributorSale = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deletedSale = await DistributorSales.delete(id);
        if (!deletedSale) {
            return next(new ApiError(404, 'Distributor sale not found.'));
        }
        res.status(200).json({ message: 'Distributor sale deleted successfully.', sale: deletedSale });
    } catch (error) {
        next(new ApiError(500, error.message));
    }
};

module.exports = {
    createDistributorSale,
    getDistributorSales,
    getDistributorSaleById,
    updateDistributorSale,
    deleteDistributorSale
};