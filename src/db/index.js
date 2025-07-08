// src/db/index.js
require('dotenv').config(); // Ensure environment variables are loaded

const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Optional: Test connection when the pool is created
pool.connect((err, client, release) => {
    if (err) {
        console.error('Error connecting to the database:', err.stack);
        process.exit(1); // Exit process if database connection fails
    }
    client.query('SELECT NOW()', (err, result) => {
        release(); // Release the client back to the pool
        if (err) {
            console.error('Error testing database query:', err.stack);
            process.exit(1);
        }
        console.log('Database pool initialized and connected successfully.');
    });
});

module.exports = pool; // Export the pool for use in other modules