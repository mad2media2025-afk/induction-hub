// routes/payment.js
// POST /api/payment/create-order   — create Razorpay order, returns order_id
// POST /api/payment/verify         — verify payment signature after success
// POST /api/payment/webhook        — Razorpay webhook for async payment events

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const razorpay = require('../config/razorpay');
const { getDB } = require('../config/firebase');
const authMiddleware = require('../middleware/auth');
const { sendOrderConfirmationEmail } = require('../utils/email');

// ── CREATE RAZORPAY ORDER ─────────────────────────────────────────
// Called when customer clicks "Place Order"
// Returns a Razorpay order_id that the frontend uses to open the payment modal
router.post('/create-order', authMiddleware, async (req, res) => {
  const { cartItems, addressId, paymentMethod, discountPercentage = 0, couponCode = null } = req.body;

  if (!cartItems || cartItems.length === 0) {
    return res.status(400).json({ error: 'Cart is empty.' });
  }

  // Validate discount percentage (prevent abuse frontend values)
  const safeDiscount = (discountPercentage === 10 || discountPercentage === 15) ? discountPercentage : 0;

  const db = getDB();

  try {
    // Fetch live prices from Firestore (NEVER trust prices from frontend)
    let subtotal = 0;
    const verifiedItems = [];

    for (const item of cartItems) {
      const doc = await db.collection('products').doc(item.id).get();
      if (!doc.exists) return res.status(404).json({ error: `Product ${item.id} not found.` });
      const product = doc.data();
      if (!product.inStock) return res.status(400).json({ error: `${product.name} is out of stock.` });

      subtotal += product.price * item.qty;
      verifiedItems.push({ id: item.id, name: product.name, brand: product.brand, price: product.price, qty: item.qty });
    }

    const shipping = subtotal >= 2000 ? 0 : 99;
    const gst = Math.round(subtotal * 0.18);
    const discountAmt = safeDiscount > 0 ? Math.round((subtotal + gst) * safeDiscount / 100) : 0;
    const total = subtotal + shipping + gst - discountAmt;

    // Razorpay amount is in paise (1 INR = 100 paise)
    const razorpayOrder = await razorpay.orders.create({
      amount: total * 100,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
      notes: {
        customerEmail: req.user.email,
        customerName: req.user.name,
      },
    });

    // Save a pending order in Firestore
    const orderRef = db.collection('orders').doc();
    await orderRef.set({
      orderId: orderRef.id,
      razorpayOrderId: razorpayOrder.id,
      userId: req.user.uid,
      customerEmail: req.user.email,
      customerName: req.user.name,
      items: verifiedItems,
      subtotal,
      shipping,
      gst,
      discountAmt,
      couponCode,
      total,
      addressId: addressId || null,
      paymentMethod: paymentMethod || 'razorpay',
      status: 'pending',        // pending → paid → processing → shipped → delivered
      paymentStatus: 'pending', // pending → paid → failed
      createdAt: new Date().toISOString(),
    });

    res.json({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      internalOrderId: orderRef.id,
      keyId: process.env.RAZORPAY_KEY_ID, // needed by Razorpay frontend SDK
    });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ error: 'Failed to create order. Please try again.' });
  }
});

// ── VERIFY PAYMENT ────────────────────────────────────────────────
// Called after Razorpay payment modal closes successfully
// Verifies HMAC signature to confirm payment is genuine (not tampered)
router.post('/verify', authMiddleware, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, internalOrderId } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: 'Missing payment verification fields.' });
  }

  // Verify HMAC-SHA256 signature
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ error: 'Payment verification failed. Signature mismatch.' });
  }

  const db = getDB();

  try {
    // Update order status in Firestore
    const orderRef = db.collection('orders').doc(internalOrderId);
    const orderDoc = await orderRef.get();
    if (!orderDoc.exists) return res.status(404).json({ error: 'Order not found.' });

    const order = orderDoc.data();

    await orderRef.update({
      status: 'processing',
      paymentStatus: 'paid',
      razorpayPaymentId: razorpay_payment_id,
      paidAt: new Date().toISOString(),
    });

    // Send confirmation email
    try {
      await sendOrderConfirmationEmail({
        to: order.customerEmail,
        name: order.customerName,
        orderId: internalOrderId,
        items: order.items,
        total: order.total,
      });
    } catch (emailErr) {
      // Don't fail the order if email fails — just log it
      console.error('Email send failed:', emailErr.message);
    }

    res.json({
      message: 'Payment verified! Order confirmed.',
      orderId: internalOrderId,
      status: 'processing',
    });
  } catch (err) {
    console.error('Verify payment error:', err);
    res.status(500).json({ error: 'Payment verification failed.' });
  }
});

// ── RAZORPAY WEBHOOK ──────────────────────────────────────────────
// Razorpay calls this URL for async events (payment.captured, payment.failed, etc.)
// Set this URL in Razorpay Dashboard → Settings → Webhooks
// URL: https://yourdomain.com/api/payment/webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_KEY_SECRET;
  const receivedSignature = req.headers['x-razorpay-signature'];

  // Verify webhook signature
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(req.body)
    .digest('hex');

  if (expectedSignature !== receivedSignature) {
    return res.status(400).json({ error: 'Invalid webhook signature.' });
  }

  const event = JSON.parse(req.body);
  const db = getDB();

  try {
    if (event.event === 'payment.captured') {
      const razorpayOrderId = event.payload.payment.entity.order_id;
      const snapshot = await db.collection('orders')
        .where('razorpayOrderId', '==', razorpayOrderId).get();

      if (!snapshot.empty) {
        await snapshot.docs[0].ref.update({
          paymentStatus: 'paid',
          status: 'processing',
        });
      }
    }

    if (event.event === 'payment.failed') {
      const razorpayOrderId = event.payload.payment.entity.order_id;
      const snapshot = await db.collection('orders')
        .where('razorpayOrderId', '==', razorpayOrderId).get();

      if (!snapshot.empty) {
        await snapshot.docs[0].ref.update({ paymentStatus: 'failed', status: 'cancelled' });
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ error: 'Webhook processing failed.' });
  }
});

module.exports = router;
