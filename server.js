// server.js
require('dotenv').config();

const express = require('express');
const pool = require('./src/db');
const cors = require('cors');

// Import all route modules
const cakeRoutes = require('./src/routes/cake.routes');
const flavorRoutes = require('./src/routes/flavor.routes');
const cakeFlavorRoutes = require('./src/routes/cakeFlavor.routes');
const routeRoutes = require('./src/routes/route.routes');
const stopoverRoutes = require('./src/routes/stopover.routes');
const orderRoutes = require('./src/routes/order.routes');
const authRoutes = require('./src/routes/auth.routes');
const userRoutes = require('./src/routes/user.routes');
const distributorRoutes = require('./src/routes/distributor.routes');
const customerFeedbackRoutes = require('./src/routes/customerFeedback.routes');
const offersRoutes = require('./src/routes/offers.routes');
const distributorSalesRoutes = require('./src/routes/distributorSales.routes');
const uploadRoutes = require('./src/routes/upload.routes');

// Import authentication middleware
const { authenticateToken, authorizeRole } = require('./src/middleware/auth.middleware');
// Import error handling middleware
const errorMiddleware = require('./src/middleware/error.middleware');

const app = express();
const port = process.env.PORT || 3000;

// CORS Configuration (keep as is from previous step)
const corsOptions = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
};
app.use(cors(corsOptions));

// Middleware to parse JSON requests
app.use(express.json());

// Basic route to test the server
app.get('/', (req, res) => {
    res.send('Welcome to the Cake Hawker Backend API!');
});

// --- Public Routes (No authentication required) ---
app.use('/api/auth', authRoutes);
// app.post('/api/orders', orderRoutes); // Customers can place orders publicly

// --- Protected Routes (Authentication Required) ---
// All routes defined below this line will require a valid JWT token.
app.use(authenticateToken);

// --- Role-based Authorization Examples (apply authorizeRole here or within specific controllers/routes) ---
app.use('/api/users', authorizeRole(['admin']), userRoutes); // Admin-only access for user management
app.use('/api/distributors', authorizeRole(['admin']), distributorRoutes); // NEW: Admin-only access for distributor management
app.use('/api/feedback', authorizeRole(['admin']), customerFeedbackRoutes);
app.use('/api/offers', authorizeRole(['admin']), offersRoutes); // NEW: Offers management is admin-only
app.use('/api/distributor-sales', authorizeRole(['admin']), distributorSalesRoutes); // NEW: Distributor Sales management is admin-only
app.use('/api/upload', authorizeRole(['admin']), uploadRoutes); // NEW: Image upload is admin-only

// Other existing protected routes (can be accessed by any authenticated user for now,
// unless you add more specific authorizeRole middleware)
app.use('/api/cakes', cakeRoutes);
app.use('/api/flavors', flavorRoutes);
app.use('/api/cake-flavors', cakeFlavorRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/stopovers', stopoverRoutes);
app.use('/api/orders', orderRoutes);
app.post('/api/feedback', customerFeedbackRoutes);

// --- Error Handling Middleware ---
app.use(errorMiddleware);

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Access it via: http://localhost:${port}`);
});