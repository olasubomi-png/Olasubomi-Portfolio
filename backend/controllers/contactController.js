'use strict';

const config = require('../config');

/**
 * POST /api/contact
 * Accepts a contact form submission.
 * Logs the message and returns a success response.
 * Ready to wire up to nodemailer or MongoDB when credentials are added.
 */
async function submitContact(req, res, next) {
  try {
    const { name, email, subject, message } = req.body;

    /* ── Log the submission (always) ── */
    console.log(`\n📬 New contact submission`);
    console.log(`   From   : ${name} <${email}>`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Message: ${message.slice(0, 120)}${message.length > 120 ? '…' : ''}\n`);

    /* ── TODO: Send email via nodemailer ──────────────────────────────
       When SMTP_HOST / SMTP_USER / SMTP_PASS are set in .env, swap in:

       const transporter = nodemailer.createTransport({
         host: config.contact.smtpHost,
         port: config.contact.smtpPort,
         secure: false,
         auth: { user: config.contact.smtpUser, pass: config.contact.smtpPass },
       });
       await transporter.sendMail({
         from: `"Portfolio Contact" <${config.contact.smtpUser}>`,
         to: config.contact.adminEmail,
         replyTo: email,
         subject: `[Portfolio] ${subject}`,
         text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
       });
    ── ──────────────────────────────────────────────────────────── */

    /* ── TODO: Save to MongoDB ───────────────────────────────────────
       When MONGODB_URI is set in .env:

       const Contact = require('../models/Contact');
       await Contact.create({ name, email, subject, message });
    ── ──────────────────────────────────────────────────────────── */

    return res.status(200).json({
      success: true,
      message: 'Message received! I\'ll get back to you within 24 hours.',
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { submitContact };
