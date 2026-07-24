'use strict';

const multer = require('multer');
const path   = require('path');
const fs     = require('fs');
const config = require('../config');

// ── Ensure upload directories exist ──────────────────────────────────────────

const ROOT = path.join(__dirname, '../../');

[config.uploads.avatarDir, config.uploads.productDir, config.uploads.resumeDir].forEach(dir => {
  fs.mkdirSync(path.join(ROOT, dir), { recursive: true });
});

// ── Storage factory ───────────────────────────────────────────────────────────

function diskStorage(subDir) {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(ROOT, subDir));
    },
    filename: (req, file, cb) => {
      const uid    = req.user?._id?.toString() || 'anon';
      const ts     = Date.now();
      const ext    = path.extname(file.originalname).toLowerCase();
      cb(null, `${uid}-${ts}${ext}`);
    },
  });
}

// ── File filters ──────────────────────────────────────────────────────────────

function imageFilter(req, file, cb) {
  const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const ext     = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext) && file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPG, PNG, GIF, WebP) are allowed.'), false);
  }
}

function documentFilter(req, file, cb) {
  const allowed = ['.pdf', '.doc', '.docx'];
  const ext     = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF/Word documents are allowed.'), false);
  }
}

function digitalProductFilter(req, file, cb) {
  // Allow images, PDFs, ZIPs, and common document/design formats
  const allowed = [
    '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg',
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
    '.zip', '.rar', '.7z',
    '.fig', '.sketch', '.xd',
    '.mp4', '.mp3', '.wav',
    '.js', '.ts', '.html', '.css', '.json',
  ];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${ext} is not allowed.`), false);
  }
}

// ── Exportable multer instances ───────────────────────────────────────────────

const avatarUpload = multer({
  storage:    diskStorage(config.uploads.avatarDir),
  fileFilter: imageFilter,
  limits:     { fileSize: config.uploads.maxAvatarMB * 1024 * 1024 },
});

const resumeUpload = multer({
  storage:    diskStorage(config.uploads.resumeDir),
  fileFilter: documentFilter,
  limits:     { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

const productUpload = multer({
  storage:    diskStorage(config.uploads.productDir),
  fileFilter: digitalProductFilter,
  limits:     { fileSize: config.uploads.maxFileMB * 1024 * 1024 },
});

// ── Multer error handler middleware ───────────────────────────────────────────

function handleUploadError(err, req, res, next) {
  if (err instanceof multer.MulterError || err.message) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next(err);
}

module.exports = { avatarUpload, resumeUpload, productUpload, handleUploadError };
