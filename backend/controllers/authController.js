'use strict';

const crypto = require('crypto');
const path   = require('path');
const fs     = require('fs');
const User   = require('../models/User');
const config = require('../config');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  setTokenCookies,
  clearTokenCookies,
  REFRESH_MS,
} = require('../utils/jwt');
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
} = require('../utils/email');

// ── Token helpers ─────────────────────────────────────────────────────────────
const genToken   = () => crypto.randomBytes(32).toString('hex');
const hashToken  = (t) => crypto.createHash('sha256').update(t).digest('hex');

// Check DB is configured
function requireDB(res) {
  if (!config.mongo.uri) {
    res.status(503).json({
      success: false,
      message: 'Database not configured. Please set MONGODB_URI in environment variables.',
    });
    return false;
  }
  return true;
}

// ── Register ──────────────────────────────────────────────────────────────────

async function register(req, res, next) {
  if (!requireDB(res)) return;
  try {
    const { firstName, lastName, username, email, password } = req.body;

    // Check duplicates
    const existing = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
    });
    if (existing) {
      const field = existing.email === email.toLowerCase() ? 'email' : 'username';
      return res.status(409).json({
        success: false,
        message: field === 'email'
          ? 'An account with this email already exists.'
          : 'This username is already taken.',
        field,
      });
    }

    // Verification token
    const verificationToken       = genToken();
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await User.create({
      firstName,
      lastName,
      username: username.toLowerCase(),
      email:    email.toLowerCase(),
      password,
      verificationToken:       hashToken(verificationToken),
      verificationTokenExpiry,
    });

    // Send verification email (non-blocking)
    sendVerificationEmail(user.email, verificationToken, user.firstName)
      .catch(err => console.error('[Auth] Verification email failed:', err.message));

    return res.status(201).json({
      success: true,
      message: 'Account created! Please check your email to verify your account before logging in.',
    });
  } catch (err) {
    next(err);
  }
}

// ── Login ─────────────────────────────────────────────────────────────────────

async function login(req, res, next) {
  if (!requireDB(res)) return;
  try {
    const { login: loginId, password } = req.body;

    // Allow login with email or username
    const user = await User.findOne({
      $or: [
        { email:    loginId.toLowerCase() },
        { username: loginId.toLowerCase() },
      ],
    }).select('+password +refreshTokens');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect email/username or password.',
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in.',
        code: 'EMAIL_NOT_VERIFIED',
      });
    }

    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact support.',
      });
    }

    // Issue tokens
    const accessToken  = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Store hashed refresh token, keep max 5 (multi-device)
    user.cleanExpiredTokens();
    user.refreshTokens.push({
      token:     hashToken(refreshToken),
      expiresAt: new Date(Date.now() + REFRESH_MS),
    });
    if (user.refreshTokens.length > 5) {
      user.refreshTokens = user.refreshTokens.slice(-5);
    }
    user.lastLogin = new Date();
    await user.save();

    setTokenCookies(res, accessToken, refreshToken);

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      data: { user: user.toSafeObject() },
    });
  } catch (err) {
    next(err);
  }
}

// ── Logout ────────────────────────────────────────────────────────────────────

async function logout(req, res, next) {
  try {
    const rt = req.cookies?.refresh_token;
    if (rt && req.user) {
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { refreshTokens: { token: hashToken(rt) } },
      });
    }
    clearTokenCookies(res);
    return res.status(200).json({ success: true, message: 'Logged out successfully.' });
  } catch (err) {
    next(err);
  }
}

// ── Verify email ──────────────────────────────────────────────────────────────

async function verifyEmail(req, res, next) {
  if (!requireDB(res)) return;
  try {
    const { token } = req.params;
    const hashed    = hashToken(token);

    const user = await User.findOne({
      verificationToken:       hashed,
      verificationTokenExpiry: { $gt: Date.now() },
    }).select('+verificationToken +verificationTokenExpiry');

    if (!user) {
      return res.redirect('/auth/verify-email.html?status=invalid');
    }

    user.isVerified              = true;
    user.verificationToken       = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();

    // Welcome email (non-blocking)
    sendWelcomeEmail(user.email, user.firstName)
      .catch(err => console.error('[Auth] Welcome email failed:', err.message));

    return res.redirect('/auth/verify-email.html?status=success');
  } catch (err) {
    next(err);
  }
}

// ── Resend verification ───────────────────────────────────────────────────────

async function resendVerification(req, res, next) {
  if (!requireDB(res)) return;
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+verificationToken +verificationTokenExpiry');

    if (!user || user.isVerified) {
      return res.status(200).json({
        success: true,
        message: 'If an unverified account exists with that email, a new link has been sent.',
      });
    }

    const token  = genToken();
    user.verificationToken       = hashToken(token);
    user.verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    sendVerificationEmail(user.email, token, user.firstName)
      .catch(err => console.error('[Auth] Resend verification failed:', err.message));

    return res.status(200).json({
      success: true,
      message: 'If an unverified account exists with that email, a new link has been sent.',
    });
  } catch (err) {
    next(err);
  }
}

// ── Forgot password ───────────────────────────────────────────────────────────

async function forgotPassword(req, res, next) {
  if (!requireDB(res)) return;
  try {
    const { email } = req.body;
    const user      = await User.findOne({ email: email.toLowerCase() });

    // Generic response prevents email enumeration
    const generic = {
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
    };

    if (!user) return res.status(200).json(generic);

    const token  = genToken();
    user.resetPasswordToken  = hashToken(token);
    user.resetPasswordExpiry = new Date(Date.now() + 60 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    try {
      await sendPasswordResetEmail(user.email, token, user.firstName);
    } catch (emailErr) {
      console.error('[Auth] Reset email failed:', emailErr.message);
      user.resetPasswordToken  = undefined;
      user.resetPasswordExpiry = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({
        success: false,
        message: 'Failed to send reset email. Please try again later.',
      });
    }

    return res.status(200).json(generic);
  } catch (err) {
    next(err);
  }
}

// ── Reset password ────────────────────────────────────────────────────────────

async function resetPassword(req, res, next) {
  if (!requireDB(res)) return;
  try {
    const { token }    = req.params;
    const { password } = req.body;
    const hashed       = hashToken(token);

    const user = await User.findOne({
      resetPasswordToken:  hashed,
      resetPasswordExpiry: { $gt: Date.now() },
    }).select('+resetPasswordToken +resetPasswordExpiry +refreshTokens');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Password reset link is invalid or has expired.',
      });
    }

    user.password            = password;
    user.resetPasswordToken  = undefined;
    user.resetPasswordExpiry = undefined;
    user.refreshTokens       = []; // Invalidate all sessions
    await user.save();

    clearTokenCookies(res);

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully. Please log in with your new password.',
    });
  } catch (err) {
    next(err);
  }
}

// ── Refresh token ─────────────────────────────────────────────────────────────

async function refreshToken(req, res, next) {
  if (!requireDB(res)) return;
  try {
    const rt = req.cookies?.refresh_token;

    if (!rt) {
      return res.status(401).json({ success: false, message: 'No refresh token provided.' });
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(rt);
    } catch {
      clearTokenCookies(res);
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token.' });
    }

    const user = await User.findById(decoded.id).select('+refreshTokens');
    if (!user) {
      clearTokenCookies(res);
      return res.status(401).json({ success: false, message: 'User not found.' });
    }

    const hashed = hashToken(rt);
    const stored = user.refreshTokens.find(t => t.token === hashed);

    if (!stored || stored.expiresAt < new Date()) {
      clearTokenCookies(res);
      return res.status(401).json({ success: false, message: 'Refresh token is revoked or expired.' });
    }

    // Rotate: remove old, issue new
    user.refreshTokens = user.refreshTokens.filter(t => t.token !== hashed);
    const newAccess    = generateAccessToken(user._id);
    const newRefresh   = generateRefreshToken(user._id);
    user.refreshTokens.push({
      token:     hashToken(newRefresh),
      expiresAt: new Date(Date.now() + REFRESH_MS),
    });
    await user.save();

    setTokenCookies(res, newAccess, newRefresh);

    return res.status(200).json({ success: true, message: 'Token refreshed.' });
  } catch (err) {
    next(err);
  }
}

// ── Get current user ──────────────────────────────────────────────────────────

async function getMe(req, res, next) {
  try {
    return res.status(200).json({
      success: true,
      data: { user: req.user.toSafeObject() },
    });
  } catch (err) {
    next(err);
  }
}

// ── Update profile ────────────────────────────────────────────────────────────

async function updateProfile(req, res, next) {
  try {
    const { firstName, lastName, profile } = req.body;

    const updates = {};
    if (firstName !== undefined) updates.firstName = firstName;
    if (lastName  !== undefined) updates.lastName  = lastName;
    if (profile   !== undefined) updates.profile   = profile;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: { user: user.toSafeObject() },
    });
  } catch (err) {
    next(err);
  }
}

// ── Upload avatar ─────────────────────────────────────────────────────────────

async function updateAvatar(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image file.' });
    }

    const avatarUrl = `/${config.uploads.avatarDir}/${req.file.filename}`;

    // Delete old avatar (local uploads only)
    if (req.user.avatar && req.user.avatar.startsWith('/assets/uploads/')) {
      const oldPath = path.join(__dirname, '../../', req.user.avatar);
      fs.unlink(oldPath, () => {}); // silent fail
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarUrl },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Avatar updated.',
      data: { avatarUrl, user: user.toSafeObject() },
    });
  } catch (err) {
    next(err);
  }
}

// ── Change password ───────────────────────────────────────────────────────────

async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password +refreshTokens');

    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect.',
      });
    }

    // Invalidate all sessions, then re-issue for current device
    user.password      = newPassword;
    user.refreshTokens = [];
    await user.save();

    const accessToken  = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshTokens.push({
      token:     hashToken(refreshToken),
      expiresAt: new Date(Date.now() + REFRESH_MS),
    });
    await user.save();

    setTokenCookies(res, accessToken, refreshToken);

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully. All other sessions have been logged out.',
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  logout,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  refreshToken,
  getMe,
  updateProfile,
  updateAvatar,
  changePassword,
};
