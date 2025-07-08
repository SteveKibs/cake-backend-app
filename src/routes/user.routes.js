// src/routes/user.routes.js
const express = require('express');
const {
    getUsers,
    getUserById,
    updateUser,
    deleteUser
} = require('../controllers/user.controller');
const validate = require('../middleware/validation.middleware');
const {
    getUsersSchema,
    updateUserSchema,
    getUserIdSchema
} = require('../validations/auth.validation'); // Re-using auth validation schemas for user routes

const router = express.Router();

// Define API routes for user management (Admin only)
router.get('/', validate({ query: getUsersSchema }), getUsers);         // GET /api/users - Get all users
router.get('/:id', validate({ params: getUserIdSchema }), getUserById); // GET /api/users/:id - Get user by ID
router.put('/:id', validate({ params: getUserIdSchema, body: updateUserSchema }), updateUser); // PUT /api/users/:id - Update user
router.delete('/:id', validate({ params: getUserIdSchema }), deleteUser); // DELETE /api/users/:id - Delete user

module.exports = router;