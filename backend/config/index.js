'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

/**
 * Centralised configuration — all env vars accessed through here.
 * Never import process.env directly elsewhere in the codebase.
 */
const config = {
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // Client URL (used in emails, redirects)
  clientUrl: process.env.CLIENT_URL || `http://localhost:${process.env.PORT || 3000}`,

  // CORS — comma-separated list of allowed origins
  allowedOrigins: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : ['*'],

  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 100,
    contactMax: 10,
    authMax: 20,          // stricter for auth endpoints
  },

  // JWT
  jwt: {
    accessSecret:  process.env.JWT_ACCESS_SECRET  || 'change-me-access-secret-minimum-32-chars',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'change-me-refresh-secret-minimum-32-chars',
    accessExpiry:  process.env.JWT_ACCESS_EXPIRY  || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },

  // Cookie
  cookie: {
    secure:   process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    domain:   process.env.COOKIE_DOMAIN || undefined,
  },

  // Contact form (prepare for nodemailer / MongoDB)
  contact: {
    adminEmail: process.env.ADMIN_EMAIL || 'vegasola8@gmail.com',
    smtpHost:   process.env.SMTP_HOST   || '',
    smtpPort:   parseInt(process.env.SMTP_PORT, 10) || 587,
    smtpUser:   process.env.SMTP_USER   || '',
    smtpPass:   process.env.SMTP_PASS   || '',
    emailFrom:  process.env.EMAIL_FROM  || `"Portfolio Platform" <${process.env.SMTP_USER || 'noreply@example.com'}>`,
  },

  // MongoDB
  mongo: {
    uri: process.env.MONGODB_URI || '',
  },

  // File uploads
  uploads: {
    avatarDir:   'assets/uploads/avatars',
    productDir:  'assets/uploads/products',
    resumeDir:   'assets/uploads/resumes',
    maxAvatarMB: 5,
    maxFileMB:   50,
  },
};

module.exports = config;
