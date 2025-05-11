// routes/auth.js
const express = require('express');
const router = express.Router();

// Import controller functions for authentication
const {
  registerUser,
  loginUserWithToken, // Using the token-based login controller function
  handleGoogleSignIn
} = require('../controllers/authController'); // Adjust path as necessary

// --- Authentication Routes ---

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user with email and password
 * @access  Public
 */
router.post('/register', registerUser);

/**
 * @route   POST /api/auth/login
 * @desc    Login user by verifying a Firebase ID token obtained from client-side Firebase SDK login.
 * @access  Public
 * @body    { "idToken": "Firebase ID token from client" }
 */
router.post('/login', loginUserWithToken);

/**
 * @route   POST /api/auth/google
 * @desc    Handle user sign-in/sign-up via Google.
 * Client completes Google Sign-In with Firebase client SDK, gets an ID token,
 * and sends that token to this endpoint for verification and user record creation/update.
 * @access  Public
 * @body    { "idToken": "Firebase ID token from client after Google Sign-In" }
 */
router.post('/google', handleGoogleSignIn);


// Example of a protected route using the verifyFirebaseToken middleware
// You would typically put this in other route files (e.g., routes/data.js)
// const verifyFirebaseToken = require('../middleware/authMiddleware'); // Adjust path
// router.get('/me', verifyFirebaseToken, (req, res) => {
//   // If token is valid, req.user will contain the decoded token (including UID)
//   res.json({ message: 'This is a protected route.', user: req.user });
// });

module.exports = router;
