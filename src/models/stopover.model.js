// src/models/stopover.model.js
const pool = require('../db');

class Stopover {
    // --- CREATE a new stopover for a given route ---
    static async create(routeId, name, sequenceOrder) {
        const query = `
            INSERT INTO stopovers (route_id, name, sequence_order)
            VALUES ($1, $2, $3)
            RETURNING *;
        `;
        const values = [routeId, name, sequenceOrder];
        try {
            const { rows } = await pool.query(query, values);
            return rows[0];
        } catch (error) {
            if (error.code === '23503') { // Foreign key violation (route_id does not exist)
                throw new Error('Invalid route_id. Route does not exist.');
            }
            if (error.code === '23505') { // Unique violation (sequence_order already exists for this route)
                throw new Error('Sequence order already exists for this route. Please use a unique sequence.');
            }
            console.error('Error creating stopover:', error.message);
            throw new Error('Could not create stopover');
        }
    }

    // --- READ all stopovers (across all routes) ---
    static async findAll(options = {}) {
        const {
            page = 1,
            limit = 10,
            sortBy = 'sequence_order',
            sortOrder = 'asc',
            routeId, // optional filter by route_id
            status,  // optional filter by status
            search   // optional string search
        } = options;

        // Main query: JOIN with routes table to get route_name
        let query = `
            SELECT
                s.*, -- Select all columns from stopovers table
                r.name AS route_name, -- Select route name and alias it as route_name
                r.delivery_date AS route_delivery_date -- Also useful for navigating back to Route Detail page
            FROM stopovers s
            JOIN routes r ON s.route_id = r.id -- JOIN with the routes table
            WHERE TRUE
        `;
        const values = [];
        let valueIndex = 1;

        // Add Filters
        if (routeId) {
            query += ` AND s.route_id = $${valueIndex++}`; // Filter by s.route_id
            values.push(routeId);
        }
        if (status) {
            query += ` AND s.status = $${valueIndex++}`; // Filter by s.status
            values.push(status);
        }
        if (search) {
            query += ` AND s.name ILIKE $${valueIndex++}`; // Search in s.name
            values.push(`%${search}%`);
        }

        // Add Sorting
        const allowedSortFields = ['name', 'sequence_order', 'status', 'created_at', 'updated_at', 'route_name']; // Add route_name to sortable fields
        const actualSortBy = allowedSortFields.includes(sortBy) ? `s.${sortBy}` : 's.sequence_order'; // Prefix with 's.' for existing fields, or 'r.name' if sorting by route_name directly. Let's simplify this.
        // Simplified sorting for stopovers, using 's.' for default fields, and special case for route_name
        let finalSortBy = `s.${sortBy}`;
        if (sortBy === 'route_name') {
            finalSortBy = 'r.name';
        } else if (!allowedSortFields.includes(sortBy)) { // Fallback if invalid sortBy
            finalSortBy = 's.sequence_order';
        }

        const actualSortOrder = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
        query += ` ORDER BY ${finalSortBy} ${actualSortOrder}`;

        // Add Pagination (OFFSET and LIMIT)
        const offset = (page - 1) * limit;
        query += ` LIMIT $${valueIndex++} OFFSET $${valueIndex++}`;
        values.push(limit);
        values.push(offset);

        try {
            const { rows } = await pool.query(query, values);

            // Count total items for pagination metadata
            let countQuery = `
                SELECT COUNT(*)
                FROM stopovers s
                JOIN routes r ON s.route_id = r.id
                WHERE TRUE
            `;
            const countValues = [];
            let countValueIndex = 1;

            if (routeId) {
                countQuery += ` AND s.route_id = $${countValueIndex++}`;
                countValues.push(routeId);
            }
            if (status) {
                countQuery += ` AND s.status = $${countValueIndex++}`;
                countValues.push(status);
            }
            if (search) {
                countQuery += ` AND s.name ILIKE $${countValueIndex++}`;
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
            console.error('Error fetching all stopovers with options:', error.message);
            throw new Error('Could not retrieve stopovers');
        }
    }

    // --- READ a stopover by ID ---
    static async findById(id) {
        const query = 'SELECT * FROM stopovers WHERE id = $1;';
        try {
            const { rows } = await pool.query(query, [id]);
            return rows[0];
        } catch (error) {
            console.error('Error fetching stopover by ID:', error.message);
            throw new Error('Could not retrieve stopover');
        }
    }

    // --- Get all stopovers for a specific route, ordered by sequence ---
    static async getByRouteId(routeId) {
        const query = `
            SELECT id, route_id, name, status, sequence_order, last_updated
            FROM stopovers
            WHERE route_id = $1
            ORDER BY sequence_order ASC;
        `;
        try {
            const { rows } = await pool.query(query, [routeId]);
            return rows;
        } catch (error) {
            console.error('Error fetching stopovers for route:', error.message);
            throw new Error('Could not retrieve stopovers for this route');
        }
    }

    // --- UPDATE an existing stopover's details (not status) ---
    static async update(id, name, sequenceOrder) {
        const query = `
            UPDATE stopovers
            SET
                name = $1,
                sequence_order = $2,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $3
            RETURNING *;
        `;
        const values = [name, sequenceOrder, id];
        try {
            const { rows } = await pool.query(query, values);
            return rows[0];
        } catch (error) {
            if (error.code === '23505') { // Unique violation (sequence_order already exists for this route)
                 throw new Error('Sequence order already exists for another stopover in this route.');
            }
            console.error('Error updating stopover:', error.message);
            throw new Error('Could not update stopover');
        }
    }

    // --- Update only the status of a stopover ---
    static async updateStatus(id, newStatus) {
        const query = `
            UPDATE stopovers
            SET
                status = $1,
                last_updated = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *;
        `;
        const values = [newStatus, id];
        try {
            const { rows } = await pool.query(query, values);
            return rows[0];
        } catch (error) {
            console.error('Error updating stopover status:', error.message);
            throw new Error('Could not update stopover status');
        }
    }

    // --- DELETE a stopover ---
    static async delete(id) {
        const query = 'DELETE FROM stopovers WHERE id = $1 RETURNING *;';
        try {
            const { rows } = await pool.query(query, [id]);
            return rows[0];
        } catch (error) {
            console.error('Error deleting stopover:', error.message);
            throw new Error('Could not delete stopover');
        }
    }
}

module.exports = Stopover;