// config/firebase.js
// Initialises Firebase Admin SDK — used for Firestore (database) and Auth verification

const admin = require('firebase-admin');

let db;

function initFirebase() {
  if (admin.apps.length > 0) return; // already initialised

  const serviceAccount = {
    type: 'service_account',
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    // Aggressive cleanup for the private key to fix OpenSSL 3 "DECODER routines::unsupported"
    private_key: process.env.FIREBASE_PRIVATE_KEY 
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/"/g, '').trim()
      : undefined,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });

  console.log('✅ Firebase Admin initialised');
}

function getDB() {
  if (!db) {
    initFirebase();
    db = admin.firestore();
  }
  return db;
}

module.exports = { initFirebase, getDB, admin };
