// src/routes/order.routes.js
const express = require('express');
const {
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatus,
    deleteOrder
} = require('../controllers/order.controller');

const router = express.Router();

// Define API routes for orders
router.post('/', createOrder);                 // POST /api/orders - Create a new order
router.get('/', getOrders);                    // GET /api/orders - Get all orders
router.get('/:id', getOrderById);              // GET /api/orders/:id - Get a single order by ID
router.patch('/:id/status', updateOrderStatus); // PATCH /api/orders/:id/status - Update only the status of an order
router.delete('/:id', deleteOrder);            // DELETE /api/orders/:id - Delete an order by ID

module.exports = router;