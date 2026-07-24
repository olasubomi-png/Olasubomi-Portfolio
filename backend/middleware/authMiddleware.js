'use strict';

const { verifyAccessToken } = require('../utils/jwt');
const User   = require('../models/User');
const config = require('../config');

// ── Require authentication ────────────────────────────────────────────────────

async function protect(req, res, next) {
  try {
    // Get token from cookie or Authorization header
    let token = req.cookies?.access_token;

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.',
        code:    'NO_TOKEN',
      });
    }

    // Check DB is available
    if (!config.mongo.uri) {
      return res.status(503).json({
        success: false,
        message: 'Database not configured.',
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: err.name === 'TokenExpiredError'
          ? 'Session expired. Please log in again.'
          : 'Invalid token. Please log in again.',
        code: err.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN',
      });
    }

    // Get user (exclude sensitive fields)
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User account no longer exists.',
        code:    'USER_NOT_FOUND',
      });
    }

    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact support.',
        code:    'ACCOUNT_BANNED',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

// ── Optional authentication (attach user if logged in, don't fail) ─────────────

async function optionalAuth(req, res, next) {
  try {
    let token = req.cookies?.access_token;
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (token && config.mongo.uri) {
      const decoded = verifyAccessToken(token);
      req.user = await User.findById(decoded.id);
    }
  } catch {
    // Silently ignore — optional auth
  }
  next();
}

// ── Role-based access control ─────────────────────────────────────────────────

function restrictTo(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action.',
      });
    }
    next();
  };
}

module.exports = { protect, optionalAuth, restrictTo };
