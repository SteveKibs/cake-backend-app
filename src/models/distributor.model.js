// Reference Directory: /src/models/distributor.model.js

const pool = require('../db');

class Distributor {
    // --- CREATE a new distributor ---
    static async create(name, contactPerson, phoneNumber, email, region, commissionRate) {
        const query = `
            INSERT INTO distributors (name, contact_person, phone_number, email, region, commission_rate)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, name, contact_person, phone_number, email, region, commission_rate, created_at, updated_at;
        `;
        const values = [name, contactPerson, phoneNumber, email, region, commissionRate];
        try {
            const { rows } = await pool.query(query, values);
            return rows[0];
        } catch (error) {
            if (error.code === '23505') { // PostgreSQL unique violation error code
                throw new Error('Distributor with this phone number or email already exists.');
            }
            console.error('Error creating distributor:', error.message);
            throw new Error('Could not create distributor.');
        }
    }

    // --- READ all distributors with pagination, filtering, and sorting ---
    static async findAll(options = {}) {
        const {
            page = 1,
            limit = 10,
            sortBy = 'name',
            sortOrder = 'asc',
            region,      // optional filter
            search       // optional search term
        } = options;

        let query = 'SELECT id, name, contact_person, phone_number, email, region, commission_rate, created_at, updated_at FROM distributors WHERE TRUE';
        const values = [];
        let valueIndex = 1;

        // Add Filters
        if (region) {
            query += ` AND region ILIKE $${valueIndex++}`;
            values.push(`%${region}%`);
        }
        if (search) {
            // Search across multiple fields
            query += ` AND (name ILIKE $${valueIndex++} OR contact_person ILIKE $${valueIndex++} OR phone_number ILIKE $${valueIndex++} OR email ILIKE $${valueIndex++})`;
            values.push(`%${search}%`);
            values.push(`%${search}%`);
            values.push(`%${search}%`);
            values.push(`%${search}%`);
        }

        // Add Sorting
        const allowedSortFields = ['name', 'region', 'commission_rate', 'created_at', 'updated_at'];
        const actualSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'name';
        const actualSortOrder = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
        query += ` ORDER BY ${actualSortBy} ${actualSortOrder}`;

        // Add Pagination
        const offset = (page - 1) * limit;
        query += ` LIMIT $${valueIndex++} OFFSET $${valueIndex++}`;
        values.push(limit);
        values.push(offset);

        try {
            const { rows } = await pool.query(query, values);

            let countQuery = 'SELECT COUNT(*) FROM distributors WHERE TRUE';
            const countValues = [];
            let countValueIndex = 1;

            if (region) {
                countQuery += ` AND region ILIKE $${countValueIndex++}`;
                countValues.push(`%${region}%`);
            }
            if (search) {
                countQuery += ` AND (name ILIKE $${countValueIndex++} OR contact_person ILIKE $${countValueIndex++} OR phone_number ILIKE $${countValueIndex++} OR email ILIKE $${countValueIndex++})`;
                countValues.push(`%${search}%`);
                countValues.push(`%${search}%`);
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
            console.error('Error fetching all distributors with options:', error.message);
            throw new Error('Could not retrieve distributors.');
        }
    }

    // --- READ a distributor by ID ---
    static async findById(id) {
        const query = 'SELECT id, name, contact_person, phone_number, email, region, commission_rate, created_at, updated_at FROM distributors WHERE id = $1;';
        try {
            const { rows } = await pool.query(query, [id]);
            return rows[0];
        } catch (error) {
            console.error('Error fetching distributor by ID:', error.message);
            throw new Error('Could not retrieve distributor.');
        }
    }

    // --- UPDATE an existing distributor ---
    static async update(id, updates) {
        const { name, contact_person, phone_number, email, region, commission_rate } = updates;
        let query = `
            UPDATE distributors
            SET updated_at = CURRENT_TIMESTAMP
        `;
        const values = [];
        let valueIndex = 1;

        if (name !== undefined) {
            query += `, name = $${valueIndex++}`;
            values.push(name);
        }
        if (contact_person !== undefined) {
            query += `, contact_person = $${valueIndex++}`;
            values.push(contact_person);
        }
        if (phone_number !== undefined) {
            query += `, phone_number = $${valueIndex++}`;
            values.push(phone_number);
        }
        if (email !== undefined) {
            query += `, email = $${valueIndex++}`;
            values.push(email);
        }
        if (region !== undefined) {
            query += `, region = $${valueIndex++}`;
            values.push(region);
        }
        if (commission_rate !== undefined) {
            query += `, commission_rate = $${valueIndex++}`;
            values.push(commission_rate);
        }

        if (values.length === 0) { // No fields to update
            return null;
        }

        query += ` WHERE id = $${valueIndex++} RETURNING id, name, contact_person, phone_number, email, region, commission_rate, created_at, updated_at;`;
        values.push(id);

        try {
            const { rows } = await pool.query(query, values);
            return rows[0];
        } catch (error) {
            if (error.code === '23505') { // Unique violation error
                throw new Error('Distributor with this phone number or email already exists.');
            }
            console.error('Error updating distributor:', error.message);
            throw new Error('Could not update distributor.');
        }
    }

    // --- DELETE a distributor ---
    static async delete(id) {
        const query = 'DELETE FROM distributors WHERE id = $1 RETURNING id, name;';
        try {
            const { rows } = await pool.query(query, [id]);
            return rows[0];
        } catch (error) {
            // If there are dependent records (e.g., distributor_sales), PostgreSQL will throw a foreign key violation
            if (error.code === '23503') {
                throw new Error('Cannot delete distributor because there are associated sales records.');
            }
            console.error('Error deleting distributor:', error.message);
            throw new Error('Could not delete distributor.');
        }
    }
}

module.exports = Distributor;