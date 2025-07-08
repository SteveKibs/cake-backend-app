// src/models/user.model.js
const pool = require('../db');
const bcrypt = require('bcrypt'); // For password hashing

class User {
    // --- Create a new user (for registration) ---
    static async create(username, password, email, role = 'admin') {
        const hashedPassword = await bcrypt.hash(password, 10); // Hash password with salt rounds = 10
        const query = `
            INSERT INTO users (username, password_hash, email, role)
            VALUES ($1, $2, $3, $4)
            RETURNING id, username, email, role, created_at;
        `;
        const values = [username, hashedPassword, email, role];
        try {
            const { rows } = await pool.query(query, values);
            return rows[0];
        } catch (error) {
            if (error.code === '23505') { // PostgreSQL unique violation error code
                throw new Error('Username or email already exists.');
            }
            console.error('Error creating user:', error.message);
            throw new Error('Could not create user');
        }
    }

    // --- Find a user by username ---
    static async findByUsername(username) {
        const query = 'SELECT * FROM users WHERE username = $1;';
        try {
            const { rows } = await pool.query(query, [username]);
            return rows[0]; // Returns user object including hashed password, or undefined
        } catch (error) {
            console.error('Error finding user by username:', error.message);
            throw new Error('Could not retrieve user');
        }
    }

    // --- Find a user by ID ---
    static async findById(id) {
        const query = 'SELECT id, username, email, role, created_at FROM users WHERE id = $1;';
        try {
            const { rows } = await pool.query(query, [id]);
            return rows[0]; // Returns user object (without password hash), or undefined
        } catch (error) {
            console.error('Error finding user by ID:', error.message);
            throw new Error('Could not retrieve user');
        }
    }

    // --- Compare a plaintext password with a hashed password ---
    static async comparePassword(plaintextPassword, hashedPassword) {
        return await bcrypt.compare(plaintextPassword, hashedPassword);
    }

    // --- READ all users with pagination, filtering, and sorting (for admin) ---
    static async findAll(options = {}) {
        const {
            page = 1,
            limit = 10,
            sortBy = 'username',
            sortOrder = 'asc',
            role,    // optional filter by role
            search   // optional string search by username/email
        } = options;

        // --- MAIN QUERY CONSTRUCTION ---
        let query = 'SELECT id, username, email, role, created_at, updated_at FROM users WHERE TRUE';
        const values = []; // Parameters for the main query
        let valueIndex = 1; // Current index for the main query's parameters

        // Add Filters to main query
        if (role) {
            query += ` AND role = $${valueIndex++}`;
            values.push(role);
        }
        if (search) {
            query += ` AND (username ILIKE $${valueIndex++} OR email ILIKE $${valueIndex++})`;
            values.push(`%${search}%`);
            values.push(`%${search}%`);
        }

        // Add Sorting to main query
        const allowedSortFields = ['username', 'email', 'role', 'created_at', 'updated_at'];
        const actualSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'username';
        const actualSortOrder = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
        query += ` ORDER BY ${actualSortBy} ${actualSortOrder}`;

        // Add Pagination to main query
        const offset = (page - 1) * limit;
        query += ` LIMIT $${valueIndex++} OFFSET $${valueIndex++}`;
        values.push(limit);
        values.push(offset);

        try {
            // --- EXECUTE MAIN QUERY ---
            const { rows } = await pool.query(query, values);
            console.log({ rows }); // Keep for debugging

            // --- COUNT QUERY CONSTRUCTION ---
            let countQuery = 'SELECT COUNT(*) FROM users WHERE TRUE';
            const countValues = []; // NEW: Parameters for the count query
            let countValueIndex = 1; // NEW: Current index for the count query's parameters (starts fresh)

            // Add Filters to count query (mimic main query's filters)
            if (role) {
                countQuery += ` AND role = $${countValueIndex++}`;
                countValues.push(role);
            }
            if (search) {
                // console.log({ search }); // Keep for debugging
                // console.log({ before: countQuery }); // Keep for debugging
                // console.log({ on: ` AND (username ILIKE $${countValueIndex} OR email ILIKE $${countValueIndex + 1})` }); // Keep for debugging
                countQuery += ` AND (username ILIKE $${countValueIndex++} OR email ILIKE $${countValueIndex++})`; // Corrected parameter indexing
                // console.log({ after: countQuery }); // Keep for debugging
                countValues.push(`%${search}%`);
                countValues.push(`%${search}%`);
                // console.log({ countValues }); // Keep for debugging
            } else {
                // console.log('no search'); // Keep for debugging
            }

            // --- EXECUTE COUNT QUERY ---
            console.log({ countQuery }); // Log final count query
            console.log({ countValues }); // Log final count values
            const { rows: countRows } = await pool.query(countQuery, countValues); // Pass countValues here
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
            console.error('Error fetching all users with options:', error.message);
            throw new Error('Could not retrieve users');
        }
    }

    // --- UPDATE an existing user's details (for admin) ---
    static async update(id, updates) {
        const { username, email, role } = updates;
        let query = `
            UPDATE users
            SET updated_at = CURRENT_TIMESTAMP
        `;
        const values = [];
        let valueIndex = 1;

        if (username !== undefined) {
            query += `, username = $${valueIndex++}`;
            values.push(username);
        }
        if (email !== undefined) {
            query += `, email = $${valueIndex++}`;
            values.push(email);
        }
        if (role !== undefined) {
            query += `, role = $${valueIndex++}`;
            values.push(role);
        }

        if (values.length === 0) { // No fields to update
            return null;
        }

        query += ` WHERE id = $${valueIndex++} RETURNING id, username, email, role, created_at, updated_at;`;
        values.push(id);

        try {
            const { rows } = await pool.query(query, values);
            return rows[0];
        } catch (error) {
            if (error.code === '23505') { // Unique violation error
                throw new Error('Username or email already exists.');
            }
            console.error('Error updating user:', error.message);
            throw new Error('Could not update user');
        }
    }

    // --- DELETE a user (for admin) ---
    static async delete(id) {
        const query = 'DELETE FROM users WHERE id = $1 RETURNING id, username;';
        try {
            const { rows } = await pool.query(query, [id]);
            return rows[0];
        } catch (error) {
            console.error('Error deleting user:', error.message);
            throw new Error('Could not delete user');
        }
    }
}

module.exports = User;