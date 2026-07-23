'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

/**
 * Centralised configuration — all env vars accessed through here.
 * Never import process.env directly elsewhere in the codebase.
 */
const config = {
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // CORS — comma-separated list of allowed origins
  allowedOrigins: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : ['*'],

  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,                  // requests per window (general)
    contactMax: 10,            // stricter limit for contact endpoint
  },

  // Contact form (prepare for nodemailer / MongoDB)
  contact: {
    adminEmail: process.env.ADMIN_EMAIL || 'vegasola8@gmail.com',
    // SMTP credentials — set in .env when ready
    smtpHost: process.env.SMTP_HOST || '',
    smtpPort: parseInt(process.env.SMTP_PORT, 10) || 587,
    smtpUser: process.env.SMTP_USER || '',
    smtpPass: process.env.SMTP_PASS || '',
  },

  // MongoDB (future integration)
  mongo: {
    uri: process.env.MONGODB_URI || '',
  },
};

module.exports = config;
