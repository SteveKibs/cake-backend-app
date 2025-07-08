// src/models/order.model.js
const pool = require('../db');
const { v4: uuidv4 } = require('uuid'); // For generating UUIDs
const moment = require('moment'); // For date handling

class Order {
    /**
     * Creates a new order and its items within a database transaction.
     * Applies BOGO logic based on order_date and cake eligibility.
     *
     * @param {string} customerName
     * @param {string} customerPhone
     * @param {string} customerEmail
     * @param {Array<Object>} items - Array of { cake_id: int, quantity: int }
     * @param {number} [routeId=null] - Optional route ID
     * @param {number} [stopoverId=null] - Optional stopover ID
     * @param {string} [notes=''] - Optional notes for the order
     * @returns {Object} The created order object.
     * @throws {Error} If order creation fails.
     */
    static async createOrder(customerName, customerPhone, customerEmail, items, routeId = null, stopoverId = null, notes = '') {
        const client = await pool.connect(); // Get a client from the pool
        try {
            await client.query('BEGIN'); // Start transaction

            const orderUUID = uuidv4();
            const orderDate = new Date(); // Use current server time for order date
            let totalCost = 0;

            // Check if today is a BOGO day (Sunday in Kenya EAT, which is UTC+3)
            // Adjusting to a specific timezone for BOGO check can be complex.
            // For simplicity, we'll assume the server's local time or strictly define.
            // Let's rely on server's local date for `getDay()`
            const isBogoDay = orderDate.getDay() === 0; // Sunday is 0 for getDay()

            // 1. Insert into orders table
            const orderQuery = `
                INSERT INTO orders (order_uuid, customer_name, customer_phone, customer_email, order_date, total_cost, route_id, stopover_id, notes, status, payment_status)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'Pending', 'Pending')
                RETURNING id, order_uuid, total_cost;
            `;
            const orderValues = [orderUUID, customerName, customerPhone, customerEmail, orderDate, totalCost, routeId, stopoverId, notes];
            const { rows: orderRows } = await client.query(orderQuery, orderValues);
            const orderId = orderRows[0].id;

            // 2. Process and insert order items
            const orderItemsToInsert = [];
            for (const item of items) {
                const { cake_id, quantity } = item;

                // Fetch cake details to get its price and bogo_eligible status
                const cakeQuery = 'SELECT price, bogo_eligible FROM cakes WHERE id = $1;';
                const { rows: cakeRows } = await client.query(cakeQuery, [cake_id]);

                if (cakeRows.length === 0) {
                    throw new Error(`Cake with ID ${cake_id} not found.`);
                }

                const cakePrice = parseFloat(cakeRows[0].price);
                const cakeBogoEligible = cakeRows[0].bogo_eligible;

                let itemCost;
                let paidQuantity = quantity;

                if (isBogoDay && cakeBogoEligible) {
                    // BOGO logic: Buy One Get One Free means you pay for ceil(N/2) items
                    paidQuantity = Math.ceil(quantity / 2);
                    itemCost = cakePrice * paidQuantity;
                    console.log(`Applied BOGO for Cake ID ${cake_id}: ${quantity} items for the price of ${paidQuantity}.`);
                } else {
                    itemCost = cakePrice * quantity;
                }

                totalCost += itemCost;

                orderItemsToInsert.push({
                    order_id: orderId,
                    cake_id: cake_id,
                    quantity: quantity,
                    price_at_order: cakePrice,
                    item_cost: itemCost
                });
            }

            // 3. Insert into order_items table
            for (const item of orderItemsToInsert) {
                const itemQuery = `
                    INSERT INTO order_items (order_id, cake_id, quantity, price_at_order, item_cost)
                    VALUES ($1, $2, $3, $4, $5);
                `;
                const itemValues = [item.order_id, item.cake_id, item.quantity, item.price_at_order, item.item_cost];
                await client.query(itemQuery, itemValues);
            }

            // 4. Update total_cost in the orders table
            const updateOrderTotalQuery = `
                UPDATE orders
                SET total_cost = $1
                WHERE id = $2
                RETURNING *;
            `;
            const { rows: updatedOrderRows } = await client.query(updateOrderTotalQuery, [totalCost, orderId]);

            await client.query('COMMIT'); // Commit transaction
            return updatedOrderRows[0];

        } catch (error) {
            await client.query('ROLLBACK'); // Rollback transaction on error
            console.error('Error in createOrder transaction:', error.message);
            throw new Error('Failed to create order: ' + error.message);
        } finally {
            client.release(); // Release the client back to the pool
        }
    }

    // --- READ all orders (with aggregated items) ---
    static async findAll(options = {}) {
        const {
            page = 1,
            limit = 10,
            sortBy = 'order_date',
            sortOrder = 'desc',
            status,          // optional filter: 'Pending', 'Confirmed', etc.
            customerName,    // optional search: customer's name
            customerPhone,   // optional search: customer's phone
            deliveryDate     // optional filter: specific delivery date for associated route
        } = options;

        let query = `
            SELECT
                o.id,
                o.order_uuid,
                o.customer_name,
                o.customer_phone,
                o.customer_email,
                o.order_date,
                o.total_cost,
                o.status,
                o.payment_status,
                o.notes,
                r.name AS route_name,
                s.name AS stopover_name,
                json_agg(
                    json_build_object(
                        'cake_id', ci.cake_id,
                        'cake_name', c.name,
                        'quantity', ci.quantity,
                        'price_at_order', ci.price_at_order,
                        'item_cost', ci.item_cost
                    ) ORDER BY c.name
                ) AS items
            FROM orders o
            LEFT JOIN routes r ON o.route_id = r.id
            LEFT JOIN stopovers s ON o.stopover_id = s.id
            JOIN order_items ci ON o.id = ci.order_id
            JOIN cakes c ON ci.cake_id = c.id
            WHERE TRUE -- Placeholder for dynamic conditions
        `;
        const values = [];
        let valueIndex = 1;

        // Add Filters
        if (status) {
            query += ` AND o.status = $${valueIndex++}`;
            values.push(status);
        }
        if (customerName) {
            query += ` AND o.customer_name ILIKE $${valueIndex++}`;
            values.push(`%${customerName}%`);
        }
        if (customerPhone) {
            query += ` AND o.customer_phone ILIKE $${valueIndex++}`;
            values.push(`%${customerPhone}%`);
        }
        if (deliveryDate) {
            query += ` AND r.delivery_date = $${valueIndex++}`;
            values.push(deliveryDate);
        }

        // Group by clause is necessary for json_agg
        query += ` GROUP BY o.id, r.name, s.name`;

        // Add Sorting
        const allowedSortFields = ['order_date', 'total_cost', 'customer_name', 'status'];
        const actualSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'order_date';
        const actualSortOrder = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
        query += ` ORDER BY ${actualSortBy} ${actualSortOrder}`;

        // Add Pagination (OFFSET and LIMIT)
        const offset = (page - 1) * limit;
        query += ` LIMIT $${valueIndex++} OFFSET $${valueIndex++}`;
        values.push(limit);
        values.push(offset);

        try {
            const { rows } = await pool.query(query, values);

            // Count total items for pagination metadata
            const countQuery = `
                SELECT COUNT(DISTINCT o.id)
                FROM orders o
                LEFT JOIN routes r ON o.route_id = r.id
                WHERE TRUE
            `;
            const countValues = [];
            let countValueIndex = 1;

            if (status) {
                countQuery += ` AND o.status = $${countValueIndex++}`;
                countValues.push(status);
            }
            if (customerName) {
                countQuery += ` AND o.customer_name ILIKE $${countValueIndex++}`;
                countValues.push(`%${customerName}%`);
            }
            if (customerPhone) {
                countQuery += ` AND o.customer_phone ILIKE $${countValueIndex++}`;
                countValues.push(`%${customerPhone}%`);
            }
            if (deliveryDate) {
                countQuery += ` AND r.delivery_date = $${countValueIndex++}`;
                countValues.push(deliveryDate);
            }

            const { rows: countRows } = await pool.query(countQuery, countValues);
            const totalItems = parseInt(countRows[0].count, 10);
            const totalPages = Math.ceil(totalItems / limit);

            return {
                data: rows,
                meta: {
                    page: page,
                    limit: limit,
                    totalItems: totalItems,
                    totalPages: totalPages
                }
            };
        } catch (error) {
            console.error('Error fetching all orders with options:', error.message);
            throw new Error('Could not retrieve orders');
        }
    }

    // --- READ a single order by ID (with aggregated items) ---
    static async findById(id) {
        const query = `
            SELECT
                o.id,
                o.order_uuid,
                o.customer_name,
                o.customer_phone,
                o.customer_email,
                o.order_date,
                o.total_cost,
                o.status,
                o.payment_status,
                o.notes,
                r.name AS route_name,
                s.name AS stopover_name,
                json_agg(
                    json_build_object(
                        'cake_id', ci.cake_id,
                        'cake_name', c.name,
                        'quantity', ci.quantity,
                        'price_at_order', ci.price_at_order,
                        'item_cost', ci.item_cost
                    ) ORDER BY c.name
                ) AS items
            FROM orders o
            LEFT JOIN routes r ON o.route_id = r.id
            LEFT JOIN stopovers s ON o.stopover_id = s.id
            JOIN order_items ci ON o.id = ci.order_id
            JOIN cakes c ON ci.cake_id = c.id
            WHERE o.id = $1
            GROUP BY o.id, r.name, s.name;
        `;
        try {
            const { rows } = await pool.query(query, [id]);
            return rows[0]; // Returns the order object or undefined if not found
        } catch (error) {
            console.error('Error fetching order by ID:', error.message);
            throw new Error('Could not retrieve order');
        }
    }

    // --- Update only the status of an order ---
    static async updateOrderStatus(id, newStatus) {
        const validStatuses = ['Pending', 'Confirmed', 'Processing', 'Delivered', 'Cancelled'];
        if (!validStatuses.includes(newStatus)) {
            throw new Error(`Invalid order status. Must be one of: ${validStatuses.join(', ')}.`);
        }

        const query = `
            UPDATE orders
            SET
                status = $1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *;
        `;
        const values = [newStatus, id];
        try {
            const { rows } = await pool.query(query, values);
            return rows[0];
        } catch (error) {
            console.error('Error updating order status:', error.message);
            throw new Error('Could not update order status');
        }
    }

    // --- Delete an order ---
    // Note: Deleting an order will CASCADE DELETE its associated order_items
    static async delete(id) {
        const query = 'DELETE FROM orders WHERE id = $1 RETURNING *;';
        try {
            const { rows } = await pool.query(query, [id]);
            return rows[0];
        } catch (error) {
            console.error('Error deleting order:', error.message);
            throw new Error('Could not delete order');
        }
    }
}

module.exports = Order;