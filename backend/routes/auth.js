// routes/auth.js
// POST /api/auth/google    — verify Firebase ID token, upsert user in Firestore
// GET  /api/auth/me        — get current user profile (protected)
// PUT  /api/auth/me        — update profile (protected)

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { getDB, admin } = require('../config/firebase');
const authMiddleware = require('../middleware/auth');

// ── GOOGLE SIGN-IN ───────────────────────────────────────────────
router.post('/google', [
  body('idToken').notEmpty().withMessage('ID token is required.')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'ID token is required.' });
    }

    const { idToken } = req.body;

    // Verify the Firebase ID token
    const decoded = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decoded;

    const db = getDB();

    // Upsert user in Firestore
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      // Create new user
      await userRef.set({
        uid,
        name: name || email,
        email,
        phone: '',
        photo: picture || '',
        addresses: [],
        createdAt: new Date().toISOString(),
      });
    } else {
      // Update last login and photo
      await userRef.update({
        lastLoginAt: new Date().toISOString(),
        photo: picture || userDoc.data().photo || '',
        name: name || userDoc.data().name,
      });
    }

    const userData = (await userRef.get()).data();

    res.json({
      message: 'Signed in successfully!',
      user: {
        uid: userData.uid,
        name: userData.name,
        email: userData.email,
        phone: userData.phone || '',
        photo: userData.photo || '',
      },
    });
  } catch (err) {
    console.error('Google auth error:', err);
    res.status(401).json({ error: 'Authentication failed. Invalid token.' });
  }
});

// ── GET PROFILE ───────────────────────────────────────────────────
router.get('/me', authMiddleware, async (req, res) => {
  const db = getDB();
  try {
    const userRef = db.collection('users').doc(req.user.uid);
    const userDoc = await userRef.get();
    if (!userDoc.exists) return res.status(404).json({ error: 'User not found.' });

    const user = userDoc.data();
    res.json({
      uid: user.uid,
      name: user.name,
      email: user.email,
      phone: user.phone,
      photo: user.photo || '',
      addresses: user.addresses || [],
      createdAt: user.createdAt,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile.' });
  }
});

// ── UPDATE PROFILE ────────────────────────────────────────────────
router.put('/me', authMiddleware,
  [
    body('name').optional().trim().notEmpty(),
    body('phone').optional().isMobilePhone('en-IN'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const db = getDB();
    const { name, phone } = req.body;

    try {
      const userRef = db.collection('users').doc(req.user.uid);
      const userDoc = await userRef.get();
      if (!userDoc.exists) return res.status(404).json({ error: 'User not found.' });

      const updates = {};
      if (name) updates.name = name;
      if (phone) updates.phone = phone;
      await userRef.update(updates);

      res.json({ message: 'Profile updated.', ...updates });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update profile.' });
    }
  }
);

// ── ADD ADDRESS ───────────────────────────────────────────────────
router.post('/me/addresses', authMiddleware,
  [
    body('label').notEmpty(),
    body('street').notEmpty(),
    body('city').notEmpty(),
    body('state').notEmpty(),
    body('pin').isLength({ min: 6, max: 6 }).isNumeric(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const db = getDB();
    const { label, street, city, state, pin } = req.body;

    try {
      const userRef = db.collection('users').doc(req.user.uid);
      const userDoc = await userRef.get();
      if (!userDoc.exists) return res.status(404).json({ error: 'User not found.' });

      const user = userDoc.data();

      const newAddress = {
        id: Date.now().toString(),
        label, street, city, state, pin,
        isDefault: (user.addresses || []).length === 0,
      };

      await userRef.update({
        addresses: [...(user.addresses || []), newAddress],
      });

      res.status(201).json({ message: 'Address added.', address: newAddress });
    } catch (err) {
      res.status(500).json({ error: 'Failed to add address.' });
    }
  }
);

module.exports = router;
