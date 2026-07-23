'use strict';

/* ============================================================
   OLASUBOMI Portfolio — Express.js Backend Server
   Architecture: REST API + Static file serving
   Security: Helmet, CORS, Rate Limiting, Input Validation
   ============================================================ */

const express  = require('express');
const helmet   = require('helmet');
const cors     = require('cors');
const path     = require('path');

const config          = require('./config');
const errorHandler    = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');

const contactRoutes  = require('./routes/contact');
const projectsRoutes = require('./routes/projects');
const profileRoutes  = require('./routes/profile');
const servicesRoutes = require('./routes/services');

const app = express();

/* ── Security Headers (Helmet) ── */
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:     ["'self'"],
      scriptSrc:      ["'self'", "'unsafe-inline'"],
      styleSrc:       ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc:        ["'self'", 'https://fonts.gstatic.com'],
      imgSrc:         ["'self'", 'data:', 'https:'],
      connectSrc:     ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

/* ── CORS ── */
const corsOptions = {
  origin: (origin, callback) => {
    // Allow same-origin requests (no origin) and configured origins
    if (!origin || config.allowedOrigins.includes('*') || config.allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

/* ── Body Parsing ── */
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

/* ── Serve Static Frontend (root of repo) ── */
app.use(express.static(path.join(__dirname, '..')));

/* ── API Rate Limiter ── */
app.use('/api', generalLimiter);

/* ── API Routes ── */
app.use('/api/contact',  contactRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/profile',  profileRoutes);
app.use('/api/services', servicesRoutes);

/* ── Health Check ── */
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    env:    config.nodeEnv,
    uptime: process.uptime().toFixed(2) + 's',
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
  console.log(`   OLASUBOMI Portfolio Server`);
  console.log(`   Port    : ${config.port}`);
  console.log(`   Env     : ${config.nodeEnv}`);
  console.log(`   API     : http://localhost:${config.port}/api`);
  console.log('🚀 ====================================');
  console.log('');
});

module.exports = app;
