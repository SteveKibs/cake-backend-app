// src/controllers/user.controller.js
const User = require('../models/user.model');
const ApiError = require('../utils/ApiError');

// Get all users (with pagination, filtering, sorting)
const getUsers = async (req, res, next) => {
    try {
        // Validated query params will be in req.query
        const { page, limit, sortBy, sortOrder, role, search } = req.query; // line 12

        const options = { page, limit, sortBy, sortOrder, role, search }; // line 14
        const result = await User.findAll(options); // line 15 - THIS IS THE PROBLEM LINE
        console.log({ result })

        res.status(200).json(result);
    } catch (error) {
        console.log({ error })
        next(new ApiError(500, error.message));
    }
};

// Get a single user by ID
const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id); // findById returns user without password_hash
        if (!user) {
            return next(new ApiError(404, 'User not found'));
        }
        res.status(200).json(user);
    } catch (error) {
        next(new ApiError(500, error.message));
    }
};

// Update an existing user's details (admin only)
const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = req.body; // Joi validation will ensure only allowed fields are here

        const updatedUser = await User.update(id, updates);
        if (!updatedUser) {
            return next(new ApiError(404, 'User not found or no changes provided'));
        }
        res.status(200).json(updatedUser);
    } catch (error) {
        if (error.message.includes('already exists')) { // From unique constraint in model
            return next(new ApiError(409, error.message));
        }
        next(new ApiError(500, error.message));
    }
};

// Delete a user (admin only)
const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        // Prevent deleting the user who is currently logged in (optional, but good practice)
        // This requires `req.user` to be populated by `authenticateToken` middleware.
        if (req.user && parseInt(req.user.id) === parseInt(id)) {
            return next(new ApiError(403, 'You cannot delete your own account via this endpoint.'));
        }

        const deletedUser = await User.delete(id);
        if (!deletedUser) {
            return next(new ApiError(404, 'User not found'));
        }
        res.status(200).json({ message: 'User deleted successfully', user: deletedUser });
    } catch (error) {
        next(new ApiError(500, error.message));
    }
};

module.exports = {
    getUsers,
    getUserById,
    updateUser,
    deleteUser
};