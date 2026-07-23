'use strict';

const rateLimit = require('express-rate-limit');
const config    = require('../config');

/**
 * General API rate limiter — applied to all /api/* routes.
 */
const generalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max:      config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders:   false,
  message: {
    success: false,
    message: 'Too many requests. Please try again in 15 minutes.',
  },
});

/**
 * Strict limiter for the contact form to prevent spam.
 */
const contactLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max:      config.rateLimit.contactMax,
  standardHeaders: true,
  legacyHeaders:   false,
  message: {
    success: false,
    message: 'Too many contact submissions. Please wait before trying again.',
  },
});

module.exports = { generalLimiter, contactLimiter };
