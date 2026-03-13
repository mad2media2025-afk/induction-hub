// routes/auth.js
// POST /api/auth/register  — create new account
// POST /api/auth/login     — sign in, returns JWT
// GET  /api/auth/me        — get current user profile (protected)
// PUT  /api/auth/me        — update profile (protected)

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { getDB } = require('../config/firebase');
const authMiddleware = require('../middleware/auth');

// Helper: sign a JWT for a user
function signToken(user) {
  return jwt.sign(
    { uid: user.uid, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// ── REGISTER ──────────────────────────────────────────────────────
router.post('/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be 8+ characters'),
    body('phone').optional().isMobilePhone('en-IN').withMessage('Invalid Indian mobile number'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, phone } = req.body;
    const db = getDB();

    try {
      // Check if email already exists
      const existing = await db.collection('users').where('email', '==', email).get();
      if (!existing.empty) {
        return res.status(409).json({ error: 'An account with this email already exists.' });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);

      // Create user document in Firestore
      const userRef = db.collection('users').doc();
      const userData = {
        uid: userRef.id,
        name,
        email,
        phone: phone || '',
        passwordHash,
        addresses: [],
        createdAt: new Date().toISOString(),
      };

      await userRef.set(userData);

      const token = signToken(userData);

      res.status(201).json({
        message: 'Account created successfully!',
        token,
        user: { uid: userData.uid, name, email, phone: userData.phone },
      });
    } catch (err) {
      console.error('Register error:', err);
      res.status(500).json({ error: 'Registration failed. Please try again.' });
    }
  }
);

// ── LOGIN ─────────────────────────────────────────────────────────
router.post('/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const db = getDB();

    try {
      const snapshot = await db.collection('users').where('email', '==', email).get();
      if (snapshot.empty) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const userData = snapshot.docs[0].data();
      const passwordMatch = await bcrypt.compare(password, userData.passwordHash);
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const token = signToken(userData);

      res.json({
        message: 'Signed in successfully!',
        token,
        user: { uid: userData.uid, name: userData.name, email: userData.email, phone: userData.phone },
      });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'Login failed. Please try again.' });
    }
  }
);

// ── GET PROFILE ───────────────────────────────────────────────────
router.get('/me', authMiddleware, async (req, res) => {
  const db = getDB();
  try {
    const snapshot = await db.collection('users').where('email', '==', req.user.email).get();
    if (snapshot.empty) return res.status(404).json({ error: 'User not found.' });

    const user = snapshot.docs[0].data();
    res.json({
      uid: user.uid,
      name: user.name,
      email: user.email,
      phone: user.phone,
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
      const snapshot = await db.collection('users').where('email', '==', req.user.email).get();
      if (snapshot.empty) return res.status(404).json({ error: 'User not found.' });

      const docRef = snapshot.docs[0].ref;
      const updates = {};
      if (name) updates.name = name;
      if (phone) updates.phone = phone;
      await docRef.update(updates);

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
      const snapshot = await db.collection('users').where('email', '==', req.user.email).get();
      if (snapshot.empty) return res.status(404).json({ error: 'User not found.' });

      const docRef = snapshot.docs[0].ref;
      const user = snapshot.docs[0].data();

      const newAddress = {
        id: Date.now().toString(),
        label, street, city, state, pin,
        isDefault: user.addresses.length === 0,
      };

      await docRef.update({
        addresses: [...(user.addresses || []), newAddress],
      });

      res.status(201).json({ message: 'Address added.', address: newAddress });
    } catch (err) {
      res.status(500).json({ error: 'Failed to add address.' });
    }
  }
);

module.exports = router;
