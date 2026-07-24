'use strict';

/* ============================================================
   OLASUBOMI Portfolio Platform — Express.js Backend Server
   Architecture: REST API + Static file serving
   Security: Helmet, CORS, Rate Limiting, Input Validation
   Auth: JWT (httpOnly cookies) + MongoDB + bcrypt
   ============================================================ */

const express      = require('express');
const helmet       = require('helmet');
const cors         = require('cors');
const cookieParser = require('cookie-parser');
const path         = require('path');
const mongoose     = require('mongoose');

const config             = require('./config');
const errorHandler       = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');
const logger             = require('./middleware/logger');

const contactRoutes  = require('./routes/contact');
const projectsRoutes = require('./routes/projects');
const profileRoutes  = require('./routes/profile');
const servicesRoutes = require('./routes/services');
const authRoutes     = require('./routes/auth');

const app = express();

/* ── MongoDB connection ── */
if (config.mongo.uri) {
  mongoose.connect(config.mongo.uri, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS:          45000,
  })
    .then(() => console.log('🍃 MongoDB connected'))
    .catch(err => console.error('❌ MongoDB connection error:', err.message));

  mongoose.connection.on('error',        err  => console.error('🍃 MongoDB error:', err.message));
  mongoose.connection.on('disconnected', ()   => console.warn('🍃 MongoDB disconnected'));
  mongoose.connection.on('reconnected',  ()   => console.log('🍃 MongoDB reconnected'));
} else {
  console.warn('⚠️  MONGODB_URI not set — auth features require a database connection.');
}

/* ── Security Headers (Helmet) ── */
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:     ["'self'"],
      scriptSrc:      ["'self'", "'unsafe-inline'"],
      styleSrc:       ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc:        ["'self'", 'https://fonts.gstatic.com'],
      imgSrc:         ["'self'", 'data:', 'https:', 'blob:'],
      connectSrc:     ["'self'"],
      mediaSrc:       ["'self'"],
      objectSrc:      ["'none'"],
      frameAncestors: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

/* ── CORS ── */
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || config.allowedOrigins.includes('*') || config.allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods:          ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders:   ['Content-Type', 'Authorization'],
  credentials:      true,           // required for cookies
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

/* ── Cookie Parser ── */
app.use(cookieParser());

/* ── Request Logging ── */
app.use(logger);

/* ── Body Parsing ── */
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

/* ── Serve Static Frontend (root of repo) ── */
app.use(express.static(path.join(__dirname, '..')));

/* ── API Rate Limiter ── */
app.use('/api', generalLimiter);

/* ── API Routes ── */
app.use('/api/auth',     authRoutes);
app.use('/api/contact',  contactRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/profile',  profileRoutes);
app.use('/api/services', servicesRoutes);

/* ── Health Check ── */
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status:  'ok',
    env:     config.nodeEnv,
    uptime:  process.uptime().toFixed(2) + 's',
    db:      mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

/* ── 404 for undefined /api/* routes ── */
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} /api${req.path}`,
  });
});

/* ── Catch-all: Serve index.html for all non-API routes ── */
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

/* ── Error Handler (must be last) ── */
app.use(errorHandler);

/* ── Start Server ── */
app.listen(config.port, '0.0.0.0', () => {
  console.log('');
  console.log('🚀 ====================================');
  console.log('   OLASUBOMI Portfolio Platform');
  console.log(`   Port    : ${config.port}`);
  console.log(`   Env     : ${config.nodeEnv}`);
  console.log(`   API     : http://localhost:${config.port}/api`);
  console.log(`   Auth    : http://localhost:${config.port}/api/auth`);
  console.log(`   DB      : ${config.mongo.uri ? 'configured' : 'NOT SET'}`);
  console.log('🚀 ====================================');
  console.log('');
});

module.exports = app;
