const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage');

const serviceAccount = require('./sharpform-69b09-firebase-adminsdk-fbsvc-049f132cca.json');

try {
  initializeApp({
    credential: cert(serviceAccount),
    storageBucket: 'sharpform-69b09.firebasestorage.app',
    projectId: 'sharpform-69b09'
  });
  console.log('Firebase Admin SDK initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
  process.exit(1);
}

const auth = getAuth();
const db = getFirestore();
const storage = getStorage().bucket();

module.exports = { auth, db, storage };