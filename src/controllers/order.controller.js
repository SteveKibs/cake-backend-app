// src/controllers/order.controller.js
const Order = require('../models/order.model');
const Cake = require('../models/cake.model'); // To validate cake existence
const Route = require('../models/route.model'); // To validate route existence
const Stopover = require('../models/stopover.model'); // To validate stopover existence

// Create a new order
const createOrder = async (req, res) => {
    try {
        const { customer_name, customer_phone, customer_email, items, route_id, stopover_id, notes } = req.body;

        // Basic input validation
        if (!customer_name || !customer_phone || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Customer name, phone, and at least one item are required.' });
        }

        // Validate each item and ensure cakes exist
        for (const item of items) {
            if (!item.cake_id || !item.quantity || item.quantity <= 0) {
                return res.status(400).json({ message: 'Each item must have a valid cake_id and quantity > 0.' });
            }
            const cakeExists = await Cake.findById(item.cake_id);
            if (!cakeExists) {
                return res.status(404).json({ message: `Cake with ID ${item.cake_id} not found.` });
            }
        }

        // Optional: Validate route and stopover IDs if provided
        if (route_id) {
            const routeExists = await Route.findById(route_id);
            if (!routeExists) {
                return res.status(404).json({ message: `Route with ID ${route_id} not found.` });
            }
        }
        if (stopover_id) {
            const stopoverExists = await Stopover.findById(stopover_id);
            if (!stopoverExists) {
                return res.status(404).json({ message: `Stopover with ID ${stopover_id} not found.` });
            }
        }


        const newOrder = await Order.createOrder(
            customer_name,
            customer_phone,
            customer_email,
            items,
            route_id,
            stopover_id,
            notes
        );
        res.status(201).json(newOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all orders
const getOrders = async (req, res) => {
    try {
        const orders = await Order.findAll();
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single order by ID
const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update the status of an order
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Model method has validation for valid statuses
        const updatedOrder = await Order.updateOrderStatus(id, status);
        if (!updatedOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete an order
const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedOrder = await Order.delete(id);
        if (!deletedOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(200).json({ message: 'Order deleted successfully', order: deletedOrder });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatus,
    deleteOrder
};