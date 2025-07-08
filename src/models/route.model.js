// src/models/route.model.js
const pool = require('../db');

class Route {
    // --- CREATE a new route ---
    static async create(name, deliveryDate, isActive = false) {
        const query = `
            INSERT INTO routes (name, delivery_date, is_active)
            VALUES ($1, $2, $3)
            RETURNING *;
        `;
        const values = [name, deliveryDate, isActive];
        try {
            const { rows } = await pool.query(query, values);
            return rows[0];
        } catch (error) {
            console.error('Error creating route:', error.message);
            throw new Error('Could not create route');
        }
    }

    // --- READ all routes ---
    static async findAll(options = {}) {
        const {
            page = 1,
            limit = 10,
            sortBy = 'delivery_date',
            sortOrder = 'desc',
            isActive,      // optional boolean filter
            deliveryDate,  // optional date filter (YYYY-MM-DD string)
            search         // optional string search
        } = options;

        let query = 'SELECT * FROM routes WHERE TRUE';
        const values = [];
        let valueIndex = 1;

        // Add Filters
        if (isActive !== undefined && isActive !== null) { // Check for explicit boolean true/false
            query += ` AND is_active = $${valueIndex++}`;
            values.push(isActive);
        }
        if (deliveryDate) {
            query += ` AND delivery_date = $${valueIndex++}`;
            values.push(deliveryDate); // PostgreSQL handles 'YYYY-MM-DD' string to date
        }
        if (search) {
            query += ` AND name ILIKE $${valueIndex++}`; // Case-insensitive search on name
            values.push(`%${search}%`);
        }

        // Add Sorting
        const allowedSortFields = ['name', 'delivery_date', 'created_at', 'updated_at'];
        const actualSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'delivery_date';
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
            let countQuery = 'SELECT COUNT(*) FROM routes WHERE TRUE';
            const countValues = []; // Use separate values array for count query
            let countValueIndex = 1;

            if (isActive !== undefined && isActive !== null) {
                countQuery += ` AND is_active = $${countValueIndex++}`;
                countValues.push(isActive);
            }
            if (deliveryDate) {
                countQuery += ` AND delivery_date = $${countValueIndex++}`;
                countValues.push(deliveryDate);
            }
            if (search) {
                countQuery += ` AND name ILIKE $${countValueIndex++}`;
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
            console.error('Error fetching all routes with options:', error.message);
            throw new Error('Could not retrieve routes');
        }
    }

    // --- READ a route by ID ---
    static async findById(id) {
        const query = 'SELECT * FROM routes WHERE id = $1;';
        try {
            const { rows } = await pool.query(query, [id]);
            return rows[0];
        } catch (error) {
            console.error('Error fetching route by ID:', error.message);
            throw new Error('Could not retrieve route');
        }
    }

    // --- UPDATE an existing route ---
    static async update(id, name, deliveryDate, isActive) {
        const query = `
            UPDATE routes
            SET
                name = $1,
                delivery_date = $2,
                is_active = $3,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $4
            RETURNING *;
        `;
        const values = [name, deliveryDate, isActive, id];
        try {
            const { rows } = await pool.query(query, values);
            return rows[0];
        } catch (error) {
            console.error('Error updating route:', error.message);
            throw new Error('Could not update route');
        }
    }

    // --- DELETE a route ---
    static async delete(id) {
        const query = 'DELETE FROM routes WHERE id = $1 RETURNING *;';
        try {
            const { rows } = await pool.query(query, [id]);
            return rows[0];
        } catch (error) {
            console.error('Error deleting route:', error.message);
            throw new Error('Could not delete route');
        }
    }

    // --- Find active routes for a given date (useful for customers) ---
    static async findActiveRoutesByDate(date) {
        const query = `
            SELECT * FROM routes
            WHERE delivery_date = $1 AND is_active = TRUE
            ORDER BY name ASC;
        `;
        try {
            const { rows } = await pool.query(query, [date]);
            return rows;
        } catch (error) {
            console.error('Error fetching active routes by date:', error.message);
            throw new Error('Could not retrieve active routes for this date');
        }
    }
}

module.exports = Route;