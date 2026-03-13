// routes/orders.js
// GET /api/orders         — get current user's orders
// GET /api/orders/:id     — get single order detail

const express = require('express');
const router = express.Router();
const { getDB } = require('../config/firebase');
const authMiddleware = require('../middleware/auth');

// ── GET ALL ORDERS FOR USER ───────────────────────────────────────
router.get('/', authMiddleware, async (req, res) => {
  const db = getDB();
  try {
    const snapshot = await db.collection('orders')
      .where('userId', '==', req.user.uid)
      .orderBy('createdAt', 'desc')
      .get();

    const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ orders });
  } catch (err) {
    console.error('Get orders error:', err);
    res.status(500).json({ error: 'Failed to fetch orders.' });
  }
});

// ── GET SINGLE ORDER ──────────────────────────────────────────────
router.get('/:id', authMiddleware, async (req, res) => {
  const db = getDB();
  try {
    const doc = await db.collection('orders').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Order not found.' });

    const order = doc.data();

    // Make sure user can only see their own orders
    if (order.userId !== req.user.uid) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    res.json({ id: doc.id, ...order });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order.' });
  }
});

module.exports = router;
