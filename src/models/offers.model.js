// Reference Directory: /src/models/offers.model.js
const pool = require('../db');

class Offer {
    static async create(name, description, discountType, discountValue, startDate, endDate, applicableToAllProducts, productIds, isActive) {
        const query = `
            INSERT INTO offers (name, description, discount_type, discount_value, start_date, end_date, applicable_to_all_products, product_ids, is_active)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *;
        `;
        const values = [name, description, discountType, discountValue, startDate, endDate, applicableToAllProducts, productIds, isActive];
        try {
            const { rows } = await pool.query(query, values);
            return rows[0];
        } catch (error) {
            console.error('Error creating offer:', error.message);
            throw new Error('Could not create offer.');
        }
    }

    static async findAll(options = {}) {
        const {
            page = 1,
            limit = 10,
            sortBy = 'start_date',
            sortOrder = 'desc',
            isActive,
            discountType,
            search
        } = options;

        let query = 'SELECT * FROM offers WHERE TRUE';
        const values = [];
        let valueIndex = 1;

        if (isActive !== undefined && isActive !== null) {
            query += ` AND is_active = $${valueIndex++}`;
            values.push(isActive);
        }
        if (discountType) {
            query += ` AND discount_type = $${valueIndex++}`;
            values.push(discountType);
        }
        if (search) {
            query += ` AND (name ILIKE $${valueIndex++} OR description ILIKE $${valueIndex++})`;
            values.push(`%${search}%`);
            values.push(`%${search}%`);
        }

        const allowedSortFields = ['name', 'start_date', 'end_date', 'discount_value', 'is_active', 'created_at', 'updated_at'];
        const actualSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'start_date';
        const actualSortOrder = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
        query += ` ORDER BY ${actualSortBy} ${actualSortOrder}`;

        const offset = (page - 1) * limit;
        query += ` LIMIT $${valueIndex++} OFFSET $${valueIndex++}`;
        values.push(limit);
        values.push(offset);

        try {
            const { rows } = await pool.query(query, values);

            let countQuery = 'SELECT COUNT(*) FROM offers WHERE TRUE';
            const countValues = [];
            let countValueIndex = 1;

            if (isActive !== undefined && isActive !== null) {
                countQuery += ` AND is_active = $${countValueIndex++}`;
                countValues.push(isActive);
            }
            if (discountType) {
                countQuery += ` AND discount_type = $${countValueIndex++}`;
                countValues.push(discountType);
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
            console.error('Error fetching all offers with options:', error.message);
            throw new Error('Could not retrieve offers.');
        }
    }

    static async findById(id) {
        const query = 'SELECT * FROM offers WHERE id = $1;';
        try {
            const { rows } = await pool.query(query, [id]);
            return rows[0];
        } catch (error) {
            console.error('Error fetching offer by ID:', error.message);
            throw new Error('Could not retrieve offer.');
        }
    }

    static async update(id, updates) {
        const { name, description, discount_type, discount_value, start_date, end_date, applicable_to_all_products, product_ids, is_active } = updates;
        let query = `
            UPDATE offers
            SET updated_at = CURRENT_TIMESTAMP
        `;
        const values = [];
        let valueIndex = 1;

        if (name !== undefined) { query += `, name = $${valueIndex++}`; values.push(name); }
        if (description !== undefined) { query += `, description = $${valueIndex++}`; values.push(description); }
        if (discount_type !== undefined) { query += `, discount_type = $${valueIndex++}`; values.push(discount_type); }
        if (discount_value !== undefined) { query += `, discount_value = $${valueIndex++}`; values.push(discount_value); }
        if (start_date !== undefined) { query += `, start_date = $${valueIndex++}`; values.push(start_date); }
        if (end_date !== undefined) { query += `, end_date = $${valueIndex++}`; values.push(end_date); }
        if (applicable_to_all_products !== undefined) { query += `, applicable_to_all_products = $${valueIndex++}`; values.push(applicable_to_all_products); }
        if (product_ids !== undefined) { query += `, product_ids = $${valueIndex++}`; values.push(product_ids); }
        if (is_active !== undefined) { query += `, is_active = $${valueIndex++}`; values.push(is_active); }

        if (values.length === 0) {
            return null;
        }

        query += ` WHERE id = $${valueIndex++} RETURNING *;`;
        values.push(id);

        try {
            const { rows } = await pool.query(query, values);
            return rows[0];
        } catch (error) {
            console.error('Error updating offer:', error.message);
            throw new Error('Could not update offer.');
        }
    }

    static async delete(id) {
        const query = 'DELETE FROM offers WHERE id = $1 RETURNING *;';
        try {
            const { rows } = await pool.query(query, [id]);
            return rows[0];
        } catch (error) {
            console.error('Error deleting offer:', error.message);
            throw new Error('Could not delete offer.');
        }
    }
}

module.exports = Offer;