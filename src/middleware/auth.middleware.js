// src/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

    if (token == null) {
        return res.status(401).json({ message: 'Authentication token required' }); // No token provided
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            // Token is invalid or expired
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        req.user = user; // Attach user payload (id, username, role) to the request object
        next(); // Proceed to the next middleware/route handler
    });
};

// Middleware to authorize user role
const authorizeRole = (roles) => { // roles should be an array, e.g., ['admin', 'driver']
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({ message: 'User role not found in token' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied: Insufficient permissions' });
        }
        next(); // User has the required role, proceed
    };
};

module.exports = {
    authenticateToken,
    authorizeRole
};