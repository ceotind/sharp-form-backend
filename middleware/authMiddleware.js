// middleware/authMiddleware.js

// Import Firebase admin SDK components, specifically the 'auth' service
// This assumes you have initialized Firebase Admin in 'config/firebase.js'
// and exported 'auth' (e.g., const { auth } = require('../config/firebase');)
const { auth } = require('../config/firebase'); // Adjust path as necessary

/**
 * Express middleware to verify Firebase ID tokens.
 * If the token is valid, it attaches the decoded token (including user UID) to the request object (req.user).
 * If the token is invalid or not provided, it sends a 401 Unauthorized response.
 */
const verifyFirebaseToken = async (req, res, next) => {
  console.log('Auth middleware received request:', {
    path: req.path,
    method: req.method,
    headers: req.headers
  });
    // Get the Authorization header from the request
  const authorizationHeader = req.headers.authorization;

  console.log('Authorization header:', authorizationHeader);

  // Check if the Authorization header exists and starts with "Bearer "
  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
    console.log('Auth failed: Missing or malformed Authorization header');
    return res.status(401).json({ 
      error: 'Unauthorized', 
      details: 'No token provided or malformed header',
      receivedHeader: authorizationHeader 
    });
  }

  // Extract the token from the "Bearer <token>" string
  const idToken = authorizationHeader.split('Bearer ')[1];

  if (!idToken) {
    return res.status(401).json({ error: 'Unauthorized. Token is missing.' });
  }

  try {
    // Verify the ID token using the Firebase Admin SDK
    const decodedToken = await auth.verifyIdToken(idToken);
    // Attach the decoded token (which includes user information like UID) to the request object
    req.user = decodedToken;
    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    // If token verification fails, send a 401 Unauthorized response
    return res.status(401).json({ error: 'Unauthorized. Invalid token.' });
  }
};

module.exports = verifyFirebaseToken;
