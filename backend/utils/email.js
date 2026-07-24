'use strict';

const nodemailer = require('nodemailer');
const config     = require('../config');

// ── Transporter factory ───────────────────────────────────────────────────────

function createTransporter() {
  if (!config.contact.smtpHost || !config.contact.smtpUser || !config.contact.smtpPass) {
    return null; // SMTP not configured
  }
  return nodemailer.createTransport({
    host:   config.contact.smtpHost,
    port:   config.contact.smtpPort,
    secure: config.contact.smtpPort === 465,
    auth: {
      user: config.contact.smtpUser,
      pass: config.contact.smtpPass,
    },
  });
}

// ── Generic send helper ───────────────────────────────────────────────────────

async function sendEmail({ to, subject, html, text }) {
  const transporter = createTransporter();

  if (!transporter) {
    // Dev fallback: log email to console
    console.log('\n📧 ════ EMAIL (SMTP not configured — logging only) ════');
    console.log(`   To     : ${to}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Body   : ${text || '(HTML only)'}`);
    console.log('══════════════════════════════════════════════════════\n');
    return;
  }

  await transporter.sendMail({
    from:    config.contact.emailFrom,
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]+>/g, ''), // strip tags for plain-text fallback
  });
}

// ── Email templates ───────────────────────────────────────────────────────────

function baseLayout(content) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <style>
    body { margin:0; padding:0; background:#0a0a0f; font-family:Inter,Arial,sans-serif; color:#e0e0e0; }
    .wrapper { max-width:600px; margin:40px auto; background:#13131a; border-radius:16px; overflow:hidden; border:1px solid rgba(108,99,255,.3); }
    .header  { background:linear-gradient(135deg,#6c63ff,#4facfe); padding:32px; text-align:center; }
    .header h1 { margin:0; font-size:22px; color:#fff; letter-spacing:1px; }
    .body    { padding:32px 40px; }
    .body p  { line-height:1.7; color:#c0c0d0; margin:0 0 16px; }
    .btn     { display:inline-block; padding:14px 32px; background:linear-gradient(135deg,#6c63ff,#4facfe);
               color:#fff; text-decoration:none; border-radius:8px; font-weight:600; margin:8px 0; }
    .footer  { padding:20px 40px; text-align:center; font-size:12px; color:#555; border-top:1px solid #222; }
    .divider { height:1px; background:#222; margin:24px 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header"><h1>🚀 Portfolio Platform</h1></div>
    <div class="body">${content}</div>
    <div class="footer">
      This email was sent automatically. Please do not reply to this email.
    </div>
  </div>
</body>
</html>`;
}

// ── Specific email types ──────────────────────────────────────────────────────

async function sendVerificationEmail(email, token, firstName) {
  const url = `${config.clientUrl}/api/auth/verify-email/${token}`;

  await sendEmail({
    to:      email,
    subject: '✅ Verify your Portfolio Platform account',
    html: baseLayout(`
      <p>Hi <strong>${firstName}</strong>,</p>
      <p>Welcome to <strong>Portfolio Platform</strong>! Please verify your email address to activate your account.</p>
      <p style="text-align:center;margin:32px 0;">
        <a href="${url}" class="btn">Verify Email Address</a>
      </p>
      <div class="divider"></div>
      <p style="font-size:13px;color:#777;">This link expires in <strong>24 hours</strong>. If you didn't create an account, you can safely ignore this email.</p>
      <p style="font-size:12px;color:#555;word-break:break-all;">Or paste this URL: ${url}</p>
    `),
    text: `Hi ${firstName},\n\nVerify your account: ${url}\n\nThis link expires in 24 hours.`,
  });
}

async function sendPasswordResetEmail(email, token, firstName) {
  const url = `${config.clientUrl}/auth/reset-password.html?token=${token}`;

  await sendEmail({
    to:      email,
    subject: '🔒 Reset your Portfolio Platform password',
    html: baseLayout(`
      <p>Hi <strong>${firstName}</strong>,</p>
      <p>You requested a password reset for your Portfolio Platform account. Click the button below to set a new password.</p>
      <p style="text-align:center;margin:32px 0;">
        <a href="${url}" class="btn">Reset Password</a>
      </p>
      <div class="divider"></div>
      <p style="font-size:13px;color:#777;">This link expires in <strong>1 hour</strong>. If you didn't request this, please ignore this email — your password will not be changed.</p>
      <p style="font-size:12px;color:#555;word-break:break-all;">Or paste this URL: ${url}</p>
    `),
    text: `Hi ${firstName},\n\nReset your password: ${url}\n\nThis link expires in 1 hour.`,
  });
}

async function sendWelcomeEmail(email, firstName) {
  await sendEmail({
    to:      email,
    subject: '🎉 Welcome to Portfolio Platform!',
    html: baseLayout(`
      <p>Hi <strong>${firstName}</strong>,</p>
      <p>Your email has been verified and your account is now active. You're all set!</p>
      <p style="text-align:center;margin:32px 0;">
        <a href="${config.clientUrl}/dashboard/" class="btn">Go to Dashboard</a>
      </p>
      <div class="divider"></div>
      <p>Here's what you can do next:</p>
      <ul style="color:#c0c0d0;line-height:1.8;">
        <li>Complete your profile</li>
        <li>Upload your avatar</li>
        <li>Build your portfolio (coming soon)</li>
        <li>Publish and get discovered</li>
      </ul>
    `),
    text: `Hi ${firstName},\n\nYour account is verified! Go to your dashboard: ${config.clientUrl}/dashboard/`,
  });
}

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
};
