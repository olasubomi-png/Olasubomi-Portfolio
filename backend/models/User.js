'use strict';

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const socialLinksSchema = new mongoose.Schema({
  github:    { type: String, default: '' },
  linkedin:  { type: String, default: '' },
  twitter:   { type: String, default: '' },
  instagram: { type: String, default: '' },
  website:   { type: String, default: '' },
}, { _id: false });

const profileSchema = new mongoose.Schema({
  bio:        { type: String, maxlength: [600, 'Bio max 600 characters'], default: '' },
  location:   { type: String, maxlength: [100, 'Location max 100 characters'], default: '' },
  phone:      { type: String, maxlength: [20,  'Phone max 20 characters'],    default: '' },
  headline:   { type: String, maxlength: [120, 'Headline max 120 characters'], default: '' },
  skills:     { type: [String], default: [] },
  socialLinks: { type: socialLinksSchema, default: () => ({}) },
}, { _id: false });

const refreshTokenSchema = new mongoose.Schema({
  token:     { type: String, required: true },   // SHA-256 hash of raw token
  expiresAt: { type: Date,   required: true },
}, { _id: false });

const userSchema = new mongoose.Schema(
  {
    // ── Identity ─────────────────────────────────────────────────────
    username: {
      type:      String,
      required:  [true, 'Username is required'],
      unique:    true,
      lowercase: true,
      trim:      true,
      minlength: [3,  'Username must be at least 3 characters'],
      maxlength: [30, 'Username max 30 characters'],
      match: [
        /^[a-z0-9_-]+$/,
        'Username can only contain lowercase letters, numbers, hyphens and underscores',
      ],
    },
    email: {
      type:      String,
      required:  [true, 'Email is required'],
      unique:    true,
      lowercase: true,
      trim:      true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    password: {
      type:      String,
      required:  [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select:    false,
    },
    firstName: {
      type:      String,
      required:  [true, 'First name is required'],
      trim:      true,
      maxlength: [50, 'First name max 50 characters'],
    },
    lastName: {
      type:      String,
      required:  [true, 'Last name is required'],
      trim:      true,
      maxlength: [50, 'Last name max 50 characters'],
    },

    // ── Avatar ───────────────────────────────────────────────────────
    avatar: { type: String, default: null },

    // ── Role & status ────────────────────────────────────────────────
    role: {
      type:    String,
      enum:    ['user', 'employer', 'admin'],
      default: 'user',
    },
    isVerified:  { type: Boolean, default: false },
    isBanned:    { type: Boolean, default: false },
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date,    default: null },
    lastLogin:   { type: Date,    default: null },

    // ── Verification & reset tokens (excluded from queries by default) ─
    verificationToken:       { type: String, select: false },
    verificationTokenExpiry: { type: Date,   select: false },
    resetPasswordToken:      { type: String, select: false },
    resetPasswordExpiry:     { type: Date,   select: false },

    // ── Refresh tokens (multi-device, max 5) ─────────────────────────
    refreshTokens: {
      type:    [refreshTokenSchema],
      select:  false,
      default: [],
    },

    // ── Profile ──────────────────────────────────────────────────────
    profile: { type: profileSchema, default: () => ({}) },

    // ── Platform stats ───────────────────────────────────────────────
    stats: {
      profileViews:  { type: Number, default: 0 },
      totalSales:    { type: Number, default: 0 },
      totalEarnings: { type: Number, default: 0 },
      totalProducts: { type: Number, default: 0 },
    },

    // ── Verification badge ───────────────────────────────────────────
    isVerifiedCreator: { type: Boolean, default: false },
    isFeatured:        { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true },
  }
);

// ── Virtuals ─────────────────────────────────────────────────────────────────
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.virtual('avatarUrl').get(function () {
  if (this.avatar) return this.avatar;
  // Gravatar-style fallback using initials encoded in URL
  const initials = encodeURIComponent(
    `${this.firstName?.[0] || ''}${this.lastName?.[0] || ''}`.toUpperCase()
  );
  return `https://ui-avatars.com/api/?name=${initials}&background=6c63ff&color=fff&size=200`;
});

// ── Indexes ───────────────────────────────────────────────────────────────────
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isPublished: 1, createdAt: -1 });
userSchema.index({ verificationToken: 1 });
userSchema.index({ resetPasswordToken: 1 });

// ── Pre-save: hash password ───────────────────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ── Instance methods ──────────────────────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.cleanExpiredTokens = function () {
  this.refreshTokens = this.refreshTokens.filter(t => t.expiresAt > new Date());
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.verificationToken;
  delete obj.verificationTokenExpiry;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpiry;
  delete obj.refreshTokens;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
