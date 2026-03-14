// routes/orders.js
// GET  /api/orders         — get current user's orders
// POST /api/orders         — create a new order
// GET  /api/orders/:id     — get single order detail

const express = require('express');
const router = express.Router();
const { getDB } = require('../config/firebase');
const authMiddleware = require('../middleware/auth');
const { sendOrderConfirmationEmail } = require('../utils/email');

// ── CREATE ORDER ──────────────────────────────────────────────────
router.post('/', authMiddleware, async (req, res) => {
  const db = getDB();
  const { items, total, shipping, delivery } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Order must contain at least one item.' });
  }

  try {
    const orderId = '#IND-' + Math.random().toString(36).slice(2, 8).toUpperCase();
    const orderData = {
      orderId,
      userId: req.user.uid,
      userEmail: req.user.email,
      userName: req.user.name,
      items,
      total,
      shipping: shipping || {},
      delivery: delivery || {},
      status: 'Processing',
      createdAt: new Date().toISOString(),
    };

    const ref = db.collection('orders').doc();
    await ref.set(orderData);

    // Send confirmation email — non-blocking, do not fail order if email fails
    sendOrderConfirmationEmail({
      to: req.user.email,
      name: req.user.name,
      orderId,
      items,
      total,
    }).catch(err => console.error('📧 Email failed (non-critical):', err.message));

    res.status(201).json({ message: '✅ Order placed!', orderId, id: ref.id });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ error: 'Failed to place order.' });
  }
});

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

