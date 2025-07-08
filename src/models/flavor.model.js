// src/models/flavor.model.js
const pool = require('../db');

class Flavor {
    // --- CREATE a new flavor ---
    static async create(name) {
        const query = `
            INSERT INTO flavors (name)
            VALUES ($1)
            RETURNING *;
        `;
        try {
            const { rows } = await pool.query(query, [name]);
            return rows[0];
        } catch (error) {
            // Check for unique violation if a flavor with the same name already exists
            if (error.code === '23505') { // PostgreSQL unique violation error code
                throw new Error('Flavor with this name already exists.');
            }
            console.error('Error creating flavor:', error.message);
            throw new Error('Could not create flavor');
        }
    }

    // --- READ all flavors ---
    static async findAll(options = {}) {
        const {
            page = 1,
            limit = 10,
            sortBy = 'name',
            sortOrder = 'asc',
            search // optional string search
        } = options;

        let query = 'SELECT * FROM flavors WHERE TRUE';
        const values = [];
        let valueIndex = 1;

        // Add Filters
        if (search) {
            query += ` AND name ILIKE $${valueIndex++}`;
            values.push(`%${search}%`);
        }

        // Add Sorting
        const allowedSortFields = ['name', 'created_at', 'updated_at'];
        const actualSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'name';
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
            const countQuery = 'SELECT COUNT(*) FROM flavors WHERE TRUE';
            const countValues = [];
            let countValueIndex = 1;

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
            console.error('Error fetching all flavors with options:', error.message);
            throw new Error('Could not retrieve flavors');
        }
    }

    // --- READ a flavor by ID ---
    static async findById(id) {
        const query = 'SELECT * FROM flavors WHERE id = $1;';
        try {
            const { rows } = await pool.query(query, [id]);
            return rows[0];
        } catch (error) {
            console.error('Error fetching flavor by ID:', error.message);
            throw new Error('Could not retrieve flavor');
        }
    }

    // --- UPDATE an existing flavor ---
    static async update(id, name) {
        const query = `
            UPDATE flavors
            SET
                name = $1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *;
        `;
        try {
            const { rows } = await pool.query(query, [name, id]);
            // Check for unique violation if updating to an existing name
            if (rows.length === 0) return null; // Flavor not found
            return rows[0];
        } catch (error) {
            if (error.code === '23505') {
                throw new Error('Flavor with this name already exists.');
            }
            console.error('Error updating flavor:', error.message);
            throw new Error('Could not update flavor');
        }
    }

    // --- DELETE a flavor ---
    static async delete(id) {
        const query = 'DELETE FROM flavors WHERE id = $1 RETURNING *;';
        try {
            const { rows } = await pool.query(query, [id]);
            return rows[0];
        } catch (error) {
            console.error('Error deleting flavor:', error.message);
            throw new Error('Could not delete flavor');
        }
    }
}

module.exports = Flavor;