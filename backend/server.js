// server.js — INDUCTA Backend Entry Point
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs'); // ensure bcryptjs is added to routes

const { initFirebase } = require('./config/firebase');

// ── INIT ──────────────────────────────────────────────────────────
initFirebase();
const app = express();

// 1. Trust proxy for Render/Vercel
app.set('trust proxy', 1);

// 1.5. Add mobile-friendly headers middleware (for Instagram browser compatibility)
app.use((req, res, next) => {
  // Add headers for better mobile/Instagram compatibility
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Vary', 'Origin');
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
  next();
});

// 2. CORS - MUST BE BEFORE OTHER MIDDLEWARE
// Allow both local development and the new live Vercel site
// Instagram browser compatibility - accept requests from any origin with wildcard
app.use(cors({
  origin: function(origin, callback) {
    // Whitelist specific origins, but also allow requests without origin (Instagram WebView)
    const whitelist = [
      'https://induction-hub.vercel.app',
      'https://www.inductionshub.shop',
      'https://inductionshub.shop',
      'http://localhost:3000',
      'https://induction-hub.onrender.com'
    ];
    
    if (!origin || whitelist.includes(origin)) {
      callback(null, true);
    } else {
      // Don't reject - allow requests from Instagram browser
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'User-Agent']
}));

// 3. Welcome Route (Fixes the "Route not found" error when visiting root)
app.get('/', (req, res) => {
  res.json({ message: 'INDUCTA API is live and healthy.', documentation: '/api/health' });
});

app.get('/api/health', (req, res) => res.send('OK'));

// Keep-alive endpoint for Instagram browser & Render sleep prevention
app.get('/api/ping', (req, res) => {
  res.json({ 
    status: 'alive',
    timestamp: new Date().toISOString(),
    backend: 'online'
  });
});

// ── SECURITY MIDDLEWARE ───────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for development to avoid blocking local fetches
  crossOriginResourcePolicy: { policy: "cross-origin" },
  xPoweredBy: false
})); 

// Rate limiting — prevent brute force / abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,                 // Increased for development
  message: { error: 'Too many requests. Please try again later.' },
});
app.use('/api/', limiter);

// Stricter limit on auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { error: 'Too many login attempts. Please wait 15 minutes.' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// CORS moved to top for reliability

// ── BODY PARSING ──────────────────────────────────────────────────
// Note: /api/payment/webhook needs raw body — must come BEFORE express.json()
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// ── ROUTES ────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/orders', require('./routes/orders'));

// ── HEALTH CHECK ──────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'INDUCTA API',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ── 404 HANDLER ───────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` });
});

// ── GLOBAL ERROR HANDLER ──────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error.'
      : err.message,
  });
});

// ── START SERVER ──────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 INDUCTA API running on port ${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health\n`);
});
