// Reference Directory: /src/models/customerFeedback.model.js
const pool = require('../db');

class CustomerFeedback {
    static async create(customerName, customerContact, feedbackText, rating) {
        const query = `
            INSERT INTO customer_feedback (customer_name, customer_contact, feedback_text, rating)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const values = [customerName, customerContact, feedbackText, rating];
        try {
            const { rows } = await pool.query(query, values);
            return rows[0];
        } catch (error) {
            console.error('Error creating feedback:', error.message);
            throw new Error('Could not create feedback.');
        }
    }

    static async findAll(options = {}) {
        const {
            page = 1,
            limit = 10,
            sortBy = 'feedback_date',
            sortOrder = 'desc',
            resolved,
            rating,
            search
        } = options;

        let query = 'SELECT * FROM customer_feedback WHERE TRUE';
        const values = [];
        let valueIndex = 1;

        if (resolved !== undefined && resolved !== null) {
            query += ` AND resolved = $${valueIndex++}`;
            values.push(resolved);
        }
        if (rating) {
            query += ` AND rating = $${valueIndex++}`;
            values.push(rating);
        }
        if (search) {
            query += ` AND (customer_name ILIKE $${valueIndex++} OR feedback_text ILIKE $${valueIndex++})`;
            values.push(`%${search}%`);
            values.push(`%${search}%`);
        }

        const allowedSortFields = ['feedback_date', 'rating', 'customer_name', 'resolved', 'created_at', 'updated_at'];
        const actualSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'feedback_date';
        const actualSortOrder = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
        query += ` ORDER BY ${actualSortBy} ${actualSortOrder}`;

        const offset = (page - 1) * limit;
        query += ` LIMIT $${valueIndex++} OFFSET $${valueIndex++}`;
        values.push(limit);
        values.push(offset);

        try {
            const { rows } = await pool.query(query, values);

            let countQuery = 'SELECT COUNT(*) FROM customer_feedback WHERE TRUE';
            const countValues = [];
            let countValueIndex = 1;

            if (resolved !== undefined && resolved !== null) {
                countQuery += ` AND resolved = $${countValueIndex++}`;
                countValues.push(resolved);
            }
            if (rating) {
                countQuery += ` AND rating = $${countValueIndex++}`;
                countValues.push(rating);
            }
            if (search) {
                countQuery += ` AND (customer_name ILIKE $${countValueIndex++} OR feedback_text ILIKE $${countValueIndex++})`;
                countValues.push(`%${search}%`);
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
            console.error('Error fetching all feedback with options:', error.message);
            throw new Error('Could not retrieve feedback.');
        }
    }

    static async findById(id) {
        const query = 'SELECT * FROM customer_feedback WHERE id = $1;';
        try {
            const { rows } = await pool.query(query, [id]);
            return rows[0];
        } catch (error) {
            console.error('Error fetching feedback by ID:', error.message);
            throw new Error('Could not retrieve feedback.');
        }
    }

    static async update(id, updates) {
        const { resolved, notes } = updates;
        let query = `
            UPDATE customer_feedback
            SET updated_at = CURRENT_TIMESTAMP
        `;
        const values = [];
        let valueIndex = 1;

        if (resolved !== undefined) {
            query += `, resolved = $${valueIndex++}`;
            values.push(resolved);
        }
        if (notes !== undefined) {
            query += `, notes = $${valueIndex++}`;
            values.push(notes);
        }

        if (values.length === 0) {
            return null;
        }

        query += ` WHERE id = $${valueIndex++} RETURNING *;`;
        values.push(id);

        try {
            const { rows } = await pool.query(query, values);
            return rows[0];
        } catch (error) {
            console.error('Error updating feedback:', error.message);
            throw new Error('Could not update feedback.');
        }
    }

    static async delete(id) {
        const query = 'DELETE FROM customer_feedback WHERE id = $1 RETURNING *;';
        try {
            const { rows } = await pool.query(query, [id]);
            return rows[0];
        } catch (error) {
            console.error('Error deleting feedback:', error.message);
            throw new Error('Could not delete feedback.');
        }
    }
}

module.exports = CustomerFeedback;