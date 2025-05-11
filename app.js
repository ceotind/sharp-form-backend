// app.js (or server.js)

const express = require('express');
const cors = require('cors'); // For enabling Cross-Origin Resource Sharing
const bodyParser = require('body-parser'); // For parsing incoming request bodies
require('dotenv').config(); // For loading environment variables from a .env file

// Import your Firebase configuration (initializes Firebase Admin)
const { db, auth, storage } = require('./config/firebase'); // Import Firebase services

// Initialize the Express application
const app = express();

// Import route handlers (after express app is initialized)
const authRoutes = require('./routes/auth'); // Adjust path as necessary
const formRoutes = require('./routes/forms');
const responseRoutes = require('./routes/responses');

// --- Middleware Setup ---

// Enable CORS for all routes and origins (customize as needed for security)
app.use(cors());

// Parse JSON bodies (as sent by API clients)
app.use(bodyParser.json());
// Parse URL-encoded bodies (as sent by HTML forms)
app.use(bodyParser.urlencoded({ extended: true }));


// --- API Routes ---

// Mount authentication routes under the /api/auth prefix
app.use('/api/auth', authRoutes);

// Debug route to list all registered routes
app.get('/debug/routes', (req, res) => {
  const routes = [];
  app._router.stack.forEach(middleware => {
    if(middleware.route) { // routes registered directly on the app
      routes.push(middleware.route.path);
    } else if(middleware.name === 'router') { // router middleware 
      middleware.handle.stack.forEach(handler => {
        const route = handler.route;
        if (route) {
          const path = route.path;
          routes.push({path: middleware.regexp.toString() + path, methods: Object.keys(route.methods)});
        }
      });
    }
  });
  res.json(routes);
});

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, {
    headers: req.headers,
    body: req.body
  });
  next();
});

// Mount form routes under the /api/forms prefix
app.use('/api/forms', formRoutes);

// Mount response routes under the /api/responses prefix
app.use('/api/responses', responseRoutes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
    path: req.path,
    method: req.method
  });
});

// Error Handling Middleware (must be last)
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.name === 'FirebaseError') {
    return res.status(401).json({
      error: 'Authentication failed',
      details: err.message
    });
  }
  
  res.status(500).json({
    error: 'Internal server error',
    details: err.message
  });
});

// Define the port the server will listen on
const PORT = process.env.PORT || 3001; // Use port from .env or default to 3001

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Auth routes available at http://localhost:${PORT}/api/auth`);
  console.log(`Form routes available at http://localhost:${PORT}/api/forms`);
  console.log(`Response routes available at http://localhost:${PORT}/api/responses`);
});

module.exports = app; // Optional: for testing or other purposes
