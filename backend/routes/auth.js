'use strict';

const router  = require('express').Router();
const rateLimit = require('express-rate-limit');
const { body } = require('express-validator');
const { validate } = require('../middleware/validator');
const { protect } = require('../middleware/authMiddleware');
const { avatarUpload, handleUploadError } = require('../middleware/upload');
const ctrl = require('../controllers/authController');
const config = require('../config');

// ── Auth-specific rate limiter ────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: config.rateLimit.authMax,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { success: false, message: 'Too many attempts. Please try again in 15 minutes.' },
});

// ── Validation rule sets ──────────────────────────────────────────────────────

const registerRules = [
  body('firstName').trim().notEmpty().withMessage('First name is required.')
    .isLength({ min: 1, max: 50 }).withMessage('First name max 50 characters.'),
  body('lastName').trim().notEmpty().withMessage('Last name is required.')
    .isLength({ min: 1, max: 50 }).withMessage('Last name max 50 characters.'),
  body('username').trim().notEmpty().withMessage('Username is required.')
    .isLength({ min: 3, max: 30 }).withMessage('Username must be 3–30 characters.')
    .matches(/^[a-z0-9_-]+$/i).withMessage('Username can only contain letters, numbers, hyphens, and underscores.'),
  body('email').trim().notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please enter a valid email address.')
    .normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required.')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number.'),
];

const loginRules = [
  body('login').trim().notEmpty().withMessage('Email or username is required.'),
  body('password').notEmpty().withMessage('Password is required.'),
];

const forgotRules = [
  body('email').trim().isEmail().withMessage('Please enter a valid email address.').normalizeEmail(),
];

const resetRules = [
  body('password').notEmpty().withMessage('New password is required.')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase, and a number.'),
];

const changePasswordRules = [
  body('currentPassword').notEmpty().withMessage('Current password is required.'),
  body('newPassword').notEmpty().withMessage('New password is required.')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase, and a number.'),
];

// ── Public routes ─────────────────────────────────────────────────────────────

// POST /api/auth/register
router.post('/register', authLimiter, registerRules, validate, ctrl.register);

// POST /api/auth/login
router.post('/login', authLimiter, loginRules, validate, ctrl.login);

// POST /api/auth/logout  (works with or without a valid session)
router.post('/logout', ctrl.logout);

// GET  /api/auth/verify-email/:token
router.get('/verify-email/:token', ctrl.verifyEmail);

// POST /api/auth/resend-verification
router.post('/resend-verification', authLimiter,
  [body('email').trim().isEmail().normalizeEmail()], validate,
  ctrl.resendVerification
);

// POST /api/auth/forgot-password
router.post('/forgot-password', authLimiter, forgotRules, validate, ctrl.forgotPassword);

// POST /api/auth/reset-password/:token
router.post('/reset-password/:token', authLimiter, resetRules, validate, ctrl.resetPassword);

// POST /api/auth/refresh
router.post('/refresh', ctrl.refreshToken);

// ── Protected routes ──────────────────────────────────────────────────────────

// GET  /api/auth/me
router.get('/me', protect, ctrl.getMe);

// PATCH /api/auth/profile
router.patch('/profile', protect,
  [
    body('firstName').optional().trim().isLength({ min: 1, max: 50 }),
    body('lastName').optional().trim().isLength({ min: 1, max: 50 }),
    body('profile.bio').optional().trim().isLength({ max: 600 }).withMessage('Bio max 600 characters.'),
    body('profile.location').optional().trim().isLength({ max: 100 }),
    body('profile.headline').optional().trim().isLength({ max: 120 }),
    body('profile.phone').optional().trim().isLength({ max: 20 }),
    body('profile.skills').optional().isArray(),
    body('profile.socialLinks.github').optional().trim().isURL({ require_protocol: false }).withMessage('Invalid GitHub URL.'),
    body('profile.socialLinks.linkedin').optional().trim().isURL({ require_protocol: false }).withMessage('Invalid LinkedIn URL.'),
    body('profile.socialLinks.twitter').optional().trim(),
    body('profile.socialLinks.instagram').optional().trim(),
    body('profile.socialLinks.website').optional().trim(),
  ],
  validate,
  ctrl.updateProfile
);

// PATCH /api/auth/avatar
router.patch('/avatar', protect,
  (req, res, next) => avatarUpload.single('avatar')(req, res, next),
  handleUploadError,
  ctrl.updateAvatar
);

// PATCH /api/auth/change-password
router.patch('/change-password', protect, changePasswordRules, validate, ctrl.changePassword);

module.exports = router;
