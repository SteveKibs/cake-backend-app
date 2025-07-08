// Reference Directory: /src/models/distributorSales.model.js

const pool = require('../db');

class DistributorSales {
    static async create(distributorId, totalAmount, commissionEarned, productDetails, notes, paymentStatus) {
        const query = `
            INSERT INTO distributor_sales (distributor_id, total_amount, commission_earned, product_details, notes, payment_status)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;
        const values = [distributorId, totalAmount, commissionEarned, productDetails, notes, paymentStatus];
        try {
            const { rows } = await pool.query(query, values);
            return rows[0];
        } catch (error) {
            if (error.code === '23503') { // Foreign key violation (distributor_id does not exist)
                throw new Error('Invalid distributor_id. Distributor does not exist.');
            }
            console.error('Error creating distributor sale:', error.message);
            throw new Error('Could not create distributor sale.');
        }
    }

    static async findAll(options = {}) {
        const {
            page = 1,
            limit = 10,
            sortBy = 'sale_date',
            sortOrder = 'desc',
            distributorId,
            paymentStatus,
            startDate,
            endDate,
            search
        } = options;

        let query = `
            SELECT ds.*, d.name AS distributor_name, d.commission_rate
            FROM distributor_sales ds
            JOIN distributors d ON ds.distributor_id = d.id
            WHERE TRUE
        `;
        const values = [];
        let valueIndex = 1;

        if (distributorId) {
            query += ` AND ds.distributor_id = $${valueIndex++}`;
            values.push(distributorId);
        }
        if (paymentStatus) {
            query += ` AND ds.payment_status = $${valueIndex++}`;
            values.push(paymentStatus);
        }
        if (startDate) {
            query += ` AND ds.sale_date >= $${valueIndex++}`;
            values.push(startDate);
        }
        if (endDate) {
            query += ` AND ds.sale_date <= ($${valueIndex++} + INTERVAL '1 day')`; // Include end of day
            values.push(endDate);
        }
        if (search) {
            query += ` AND ds.notes ILIKE $${valueIndex++}`; // Search in notes
            values.push(`%${search}%`);
        }

        const allowedSortFields = ['sale_date', 'total_amount', 'commission_earned', 'distributor_id', 'payment_status', 'created_at', 'updated_at'];
        const actualSortBy = allowedSortFields.includes(sortBy) ? `ds.${sortBy}` : 'ds.sale_date'; // Prefix with ds. for clarity
        const actualSortOrder = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
        query += ` ORDER BY ${actualSortBy} ${actualSortOrder}`;

        const offset = (page - 1) * limit;
        query += ` LIMIT $${valueIndex++} OFFSET $${valueIndex++}`;
        values.push(limit);
        values.push(offset);

        try {
            const { rows } = await pool.query(query, values);

            const countQuery = `
                SELECT COUNT(*)
                FROM distributor_sales ds
                WHERE TRUE
            `;
            const countValues = [];
            let countValueIndex = 1;

            if (distributorId) {
                countQuery += ` AND ds.distributor_id = $${countValueIndex++}`;
                countValues.push(distributorId);
            }
            if (paymentStatus) {
                countQuery += ` AND ds.payment_status = $${countValueIndex++}`;
                countValues.push(paymentStatus);
            }
            if (startDate) {
                countQuery += ` AND ds.sale_date >= $${countValueIndex++}`;
                countValues.push(startDate);
            }
            if (endDate) {
                countQuery += ` AND ds.sale_date <= ($${countValueIndex++} + INTERVAL '1 day')`;
                countValues.push(endDate);
            }
            if (search) {
                countQuery += ` AND ds.notes ILIKE $${countValueIndex++}`;
                countValues.push(`%${search}%`);
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
            console.error('Error fetching all distributor sales with options:', error.message);
            throw new Error('Could not retrieve distributor sales.');
        }
    }

    static async findById(id) {
        const query = `
            SELECT ds.*, d.name AS distributor_name, d.commission_rate
            FROM distributor_sales ds
            JOIN distributors d ON ds.distributor_id = d.id
            WHERE ds.id = $1;
        `;
        try {
            const { rows } = await pool.query(query, [id]);
            return rows[0];
        } catch (error) {
            console.error('Error fetching distributor sale by ID:', error.message);
            throw new Error('Could not retrieve distributor sale.');
        }
    }

    static async update(id, updates) {
        const { total_amount, commission_earned, product_details, notes, payment_status } = updates;
        let query = `
            UPDATE distributor_sales
            SET updated_at = CURRENT_TIMESTAMP
        `;
        const values = [];
        let valueIndex = 1;

        if (total_amount !== undefined) { query += `, total_amount = $${valueIndex++}`; values.push(total_amount); }
        if (commission_earned !== undefined) { query += `, commission_earned = $${valueIndex++}`; values.push(commission_earned); }
        if (product_details !== undefined) { query += `, product_details = $${valueIndex++}`; values.push(product_details); }
        if (notes !== undefined) { query += `, notes = $${valueIndex++}`; values.push(notes); }
        if (payment_status !== undefined) { query += `, payment_status = $${valueIndex++}`; values.push(payment_status); }

        if (values.length === 0) {
            return null;
        }

        query += ` WHERE id = $${valueIndex++} RETURNING *;`;
        values.push(id);

        try {
            const { rows } = await pool.query(query, values);
            return rows[0];
        } catch (error) {
            console.error('Error updating distributor sale:', error.message);
            throw new Error('Could not update distributor sale.');
        }
    }

    static async delete(id) {
        const query = 'DELETE FROM distributor_sales WHERE id = $1 RETURNING *;';
        try {
            const { rows } = await pool.query(query, [id]);
            return rows[0];
        } catch (error) {
            console.error('Error deleting distributor sale:', error.message);
            throw new Error('Could not delete distributor sale.');
        }
    }
}

module.exports = DistributorSales;