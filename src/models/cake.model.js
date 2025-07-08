// src/models/cake.model.js
const pool = require('../db'); // Import the centralized database pool

class Cake {
    // --- CREATE a new cake ---
    static async create(name, description, price, imageUrl, bogoEligible) {
        const query = `
            INSERT INTO cakes (name, description, price, image_url, bogo_eligible)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;
        const values = [name, description, price, imageUrl, bogoEligible];
        try {
            const { rows } = await pool.query(query, values);
            return rows[0];
        } catch (error) {
            console.error('Error creating cake:', error.message);
            throw new Error('Could not create cake');
        }
    }

    // --- READ all cakes ---
    static async findAll(options = {}) {
        const {
            page = 1,
            limit = 10,
            sortBy = 'name',
            sortOrder = 'asc',
            bogoEligible, // optional boolean filter
            isAvailable,  // optional boolean filter
            search        // optional string search
        } = options;

        let query = 'SELECT * FROM cakes WHERE TRUE'; // TRUE for easy WHERE clause appending
        const values = [];
        let valueIndex = 1;

        // Add Filters
        if (bogoEligible !== undefined && bogoEligible !== null) {
            query += ` AND bogo_eligible = $${valueIndex++}`;
            values.push(bogoEligible);
        }
        if (isAvailable !== undefined && isAvailable !== null) {
            query += ` AND is_available = $${valueIndex++}`;
            values.push(isAvailable);
        }
        if (search) {
            // Case-insensitive search on name or description
            query += ` AND (name ILIKE $${valueIndex++} OR description ILIKE $${valueIndex++})`;
            values.push(`%${search}%`);
            values.push(`%${search}%`);
        }

        // Add Sorting
        const allowedSortFields = ['name', 'price', 'created_at', 'updated_at'];
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

            // For pagination, it's often useful to also return the total count of items
            // that match the filters, ignoring pagination. This helps frontend build pagination controls.
            const countQuery = 'SELECT COUNT(*) FROM cakes WHERE TRUE';
            const countValues = [];
            let countValueIndex = 1;

            if (bogoEligible !== undefined && bogoEligible !== null) {
                countQuery += ` AND bogo_eligible = $${countValueIndex++}`;
                countValues.push(bogoEligible);
            }
            if (isAvailable !== undefined && isAvailable !== null) {
                countQuery += ` AND is_available = $${countValueIndex++}`;
                countValues.push(isAvailable);
            }
            if (search) {
                countQuery += ` AND (name ILIKE $${countValueIndex++} OR description ILIKE $${countValueIndex++})`;
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
            console.error('Error fetching all cakes with options:', error.message);
            throw new Error('Could not retrieve cakes');
        }
    }

    // --- READ a cake by ID ---
    static async findById(id) {
        const query = 'SELECT * FROM cakes WHERE id = $1;';
        try {
            const { rows } = await pool.query(query, [id]);
            return rows[0]; // Returns the cake object or undefined if not found
        } catch (error) {
            console.error('Error fetching cake by ID:', error.message);
            throw new Error('Could not retrieve cake');
        }
    }

    // --- UPDATE an existing cake ---
    static async update(id, name, description, price, imageUrl, bogoEligible, isAvailable) {
        const query = `
            UPDATE cakes
            SET
                name = $1,
                description = $2,
                price = $3,
                image_url = $4,
                bogo_eligible = $5,
                is_available = $6,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $7
            RETURNING *;
        `;
        const values = [name, description, price, imageUrl, bogoEligible, isAvailable, id];
        try {
            const { rows } = await pool.query(query, values);
            return rows[0]; // Returns the updated cake object or undefined if not found
        } catch (error) {
            console.error('Error updating cake:', error.message);
            throw new Error('Could not update cake');
        }
    }

    // --- DELETE a cake ---
    static async delete(id) {
        const query = 'DELETE FROM cakes WHERE id = $1 RETURNING *;';
        try {
            const { rows } = await pool.query(query, [id]);
            return rows[0]; // Returns the deleted cake object or undefined if not found
        } catch (error) {
            console.error('Error deleting cake:', error.message);
            throw new Error('Could not delete cake');
        }
    }
}

module.exports = Cake;