// src/models/cakeFlavor.model.js
const pool = require('../db');

class CakeFlavor {
    // --- Associate a flavor with a cake ---
    static async addFlavorToCake(cakeId, flavorId) {
        const query = `
            INSERT INTO cake_flavors (cake_id, flavor_id)
            VALUES ($1, $2)
            ON CONFLICT (cake_id, flavor_id) DO NOTHING
            RETURNING *;
        `;
        const values = [cakeId, flavorId];
        try {
            const { rows } = await pool.query(query, values);
            // rows[0] will be undefined if ON CONFLICT DO NOTHING was triggered
            return rows[0];
        } catch (error) {
            console.error('Error adding flavor to cake:', error.message);
            throw new Error('Could not add flavor to cake. Check if IDs are valid or association already exists.');
        }
    }

    // --- Remove a flavor from a cake association ---
    static async removeFlavorFromCake(cakeId, flavorId) {
        const query = `
            DELETE FROM cake_flavors
            WHERE cake_id = $1 AND flavor_id = $2
            RETURNING *;
        `;
        const values = [cakeId, flavorId];
        try {
            const { rows } = await pool.query(query, values);
            return rows[0]; // Returns the deleted association or undefined if not found
        } catch (error) {
            console.error('Error removing flavor from cake:', error.message);
            throw new Error('Could not remove flavor from cake.');
        }
    }

    // --- Get all flavors for a specific cake ---
    static async getFlavorsForCake(cakeId) {
        const query = `
            SELECT f.id, f.name
            FROM flavors f
            JOIN cake_flavors cf ON f.id = cf.flavor_id
            WHERE cf.cake_id = $1
            ORDER BY f.name ASC;
        `;
        try {
            const { rows } = await pool.query(query, [cakeId]);
            return rows;
        } catch (error) {
            console.error('Error fetching flavors for cake:', error.message);
            throw new Error('Could not retrieve flavors for cake.');
        }
    }

    // --- Get all cakes for a specific flavor (optional, but useful) ---
    static async getCakesForFlavor(flavorId) {
        const query = `
            SELECT c.id, c.name, c.price, c.image_url
            FROM cakes c
            JOIN cake_flavors cf ON c.id = cf.cake_id
            WHERE cf.flavor_id = $1
            ORDER BY c.name ASC;
        `;
        try {
            const { rows } = await pool.query(query, [flavorId]);
            return rows;
        } catch (error) {
            console.error('Error fetching cakes for flavor:', error.message);
            throw new Error('Could not retrieve cakes for flavor.');
        }
    }
}

module.exports = CakeFlavor;