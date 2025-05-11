// controllers/authController.js

// Import Firebase admin SDK components from your Firebase config
// This assumes 'auth' (for user management) and potentially 'db' (for Firestore) are exported
const { auth, db } = require('../config/firebase'); // Adjust path as necessary

/**
 * Registers a new user with email and password.
 * @param {object} req - Express request object. Expected body: { email, password, displayName (optional) }
 * @param {object} res - Express response object.
 */
const registerUser = async (req, res) => {
  const { email, password, displayName } = req.body;

  // Basic validation
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    // Create a new user in Firebase Authentication
    const userRecord = await auth.createUser({
      email: email,
      password: password,
      displayName: displayName, // Optional: set a display name
      // You can add more properties here, like photoURL, disabled, etc.
    });

    // Optionally, you might want to create a user document in Firestore here
    // For example:
    // await db.collection('users').doc(userRecord.uid).set({
    //   email: userRecord.email,
    //   displayName: userRecord.displayName || '',
    //   createdAt: new Date().toISOString(),
    //   // any other initial user data
    // });

    // Respond with the created user's UID and email (excluding sensitive info like password)
    res.status(201).json({
      message: 'User registered successfully.',
      uid: userRecord.uid,
      email: userRecord.email,
    });
  } catch (error) {
    console.error('Error registering user:', error);
    // Provide a more specific error message if possible
    let errorMessage = 'Failed to register user.';
    if (error.code === 'auth/email-already-exists') {
      errorMessage = 'The email address is already in use by another account.';
    } else if (error.code === 'auth/invalid-password') {
      errorMessage = 'Password must be at least 6 characters long.';
    }
    res.status(400).json({ error: errorMessage, details: error.message });
  }
};

/**
 * Handles login by verifying a Firebase ID token provided by the client.
 * The client should sign in using Firebase client SDK (e.g., signInWithEmailAndPassword or signInWithPopup)
 * and then send the resulting ID token to this endpoint.
 * @param {object} req - Express request object. Expected body: { idToken }
 * @param {object} res - Express response object.
 */
const loginUserWithToken = async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ error: 'ID token is required for login.' });
  }

  try {
    // Verify the ID token using the Firebase Admin SDK
    const decodedToken = await auth.verifyIdToken(idToken);

    // Token is valid. The user is authenticated.
    // You can perform additional actions here if needed, e.g.,
    // - Fetch user data from Firestore
    // - Update last login timestamp
    // - Generate a session token if not solely relying on Bearer tokens for subsequent requests

    // For example, fetching user data from Firestore:
    // const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    // const userData = userDoc.exists ? userDoc.data() : null;

    res.status(200).json({
      message: 'User logged in successfully.',
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name, // if available from token (e.g., from Google Sign-In)
        picture: decodedToken.picture, // if available
        // userData: userData // if you fetched additional data
      },
      // Optionally, you could return the original token or a new custom token if needed
      // token: idToken // or a new session token
    });
  } catch (error) {
    console.error('Error verifying ID token during login:', error);
    res.status(401).json({ error: 'Login failed. Invalid or expired token.', details: error.message });
  }
};


/**
 * Handles Google Sign-In by verifying a Firebase ID token provided by the client
 * after the client completes the Google Sign-In flow with Firebase client SDK.
 * @param {object} req - Express request object. Expected body: { idToken }
 * @param {object} res - Express response object.
 */
const handleGoogleSignIn = async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ error: 'ID token from Google Sign-In is required.' });
  }

  try {
    // Verify the ID token (this token was obtained by the client from Firebase after Google Sign-In)
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const email = decodedToken.email;
    const displayName = decodedToken.name;
    const photoURL = decodedToken.picture;

    // At this point, the user is authenticated via Google.
    // You might want to check if this user already exists in your Firestore 'users' collection
    // or create/update their record.

    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      // New user, create a record in Firestore
      await userRef.set({
        email: email,
        displayName: displayName || '',
        photoURL: photoURL || '',
        provider: 'google.com', // useful to know how the user signed up
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      });
      res.status(201).json({
        message: 'Google Sign-In successful. New user created.',
        user: { uid, email, displayName, photoURL },
      });
    } else {
      // Existing user, update last login time or other details if needed
      await userRef.update({
        lastLoginAt: new Date().toISOString(),
        // Optionally update displayName and photoURL if they might change
        displayName: displayName || userDoc.data().displayName,
        photoURL: photoURL || userDoc.data().photoURL,
      });
      res.status(200).json({
        message: 'Google Sign-In successful. Existing user.',
        user: { uid, email, displayName, photoURL, ...userDoc.data() },
      });
    }
  } catch (error) {
    console.error('Error handling Google Sign-In:', error);
    res.status(401).json({ error: 'Google Sign-In failed. Invalid token or server error.', details: error.message });
  }
};

module.exports = {
  registerUser,
  loginUserWithToken, // Renamed for clarity about token-based login
  handleGoogleSignIn,
};
