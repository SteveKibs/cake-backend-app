// src/routes/auth.routes.js
const express = require('express');
const { register, login } = require('../controllers/auth.controller');

const router = express.Router();

// Define API routes for authentication
router.post('/register', register); // POST /api/auth/register - Register a new user
router.post('/login', login);       // POST /api/auth/login - Log in an existing user

module.exports = router;