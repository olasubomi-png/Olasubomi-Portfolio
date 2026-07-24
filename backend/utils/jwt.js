'use strict';

const jwt    = require('jsonwebtoken');
const config = require('../config');

const ACCESS_MS  = 15 * 60 * 1000;               // 15 minutes
const REFRESH_MS = 7 * 24 * 60 * 60 * 1000;      // 7 days

// ── Token generation ──────────────────────────────────────────────────────────

function generateAccessToken(userId) {
  return jwt.sign({ id: userId.toString() }, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiry,
  });
}

function generateRefreshToken(userId) {
  return jwt.sign({ id: userId.toString() }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiry,
  });
}

// ── Token verification ────────────────────────────────────────────────────────

function verifyAccessToken(token) {
  return jwt.verify(token, config.jwt.accessSecret);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, config.jwt.refreshSecret);
}

// ── Cookie helpers ────────────────────────────────────────────────────────────

const baseCookieOpts = {
  httpOnly: true,
  secure:   config.cookie.secure,
  sameSite: config.cookie.sameSite,
  ...(config.cookie.domain ? { domain: config.cookie.domain } : {}),
};

function setTokenCookies(res, accessToken, refreshToken) {
  res.cookie('access_token', accessToken, {
    ...baseCookieOpts,
    maxAge: ACCESS_MS,
  });
  res.cookie('refresh_token', refreshToken, {
    ...baseCookieOpts,
    maxAge: REFRESH_MS,
  });
}

function clearTokenCookies(res) {
  const clearOpts = { ...baseCookieOpts, maxAge: 0 };
  res.cookie('access_token',  '', clearOpts);
  res.cookie('refresh_token', '', clearOpts);
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  setTokenCookies,
  clearTokenCookies,
  REFRESH_MS,
};
