# Olasubomi — Premium Developer Portfolio

## Project Overview

Full-stack developer portfolio with:
- **Frontend**: HTML5 / CSS3 (glassmorphism) / Vanilla JS — glassmorphism dark/light theme, particle canvas, typing animation, FAQ accordion, animated skill bars
- **Backend**: Node.js + Express.js REST API — Helmet, CORS, rate limiting, input validation
- **Sections**: Hero, Stats, About, Skills, Services, Projects, Testimonials, Timeline, Certifications, Gallery, Blog, FAQ, Contact
- **API Endpoints**: `/api/health`, `/api/profile`, `/api/projects`, `/api/services`, `POST /api/contact`

## How to Run

The Express backend serves the static frontend AND the REST API:

```bash
cd backend && PORT=5000 node server.js
```

Workflow: **Start application** → `cd backend && PORT=5000 node server.js` → port 5000

## Project Structure

```
/
├── index.html          # Main portfolio page (all sections)
├── style.css           # Complete styles (glassmorphism, dark/light, responsive)
├── script.js           # Vanilla JS (particles, FAQ, contact form, animations)
├── images/             # Profile photo & gallery images
├── assets/cv/          # CV PDF download
├── backend/
│   ├── server.js       # Express entry point (serves static + API)
│   ├── package.json
│   ├── config/         # Centralised env config
│   ├── routes/         # Express routers
│   ├── controllers/    # Business logic
│   └── middleware/     # Helmet, CORS, rate limiter, validator
├── .env.example        # Copy to .env and fill in values
└── README.md           # Full docs including AWS deployment guide
```

## Environment Variables

Copy `.env.example` to `.env`. Key vars:
- `PORT` — server port (5000 for Replit webview)
- `NODE_ENV` — development / production
- `ALLOWED_ORIGINS` — CORS allowed origins
- `ADMIN_EMAIL` — contact form recipient
- `SMTP_*` — enable email sending via nodemailer
- `MONGODB_URI` — enable MongoDB contact storage

## User Preferences

- Keep existing project structure — do NOT restructure or migrate
- Preserve all working functionality when making changes
- Stack: HTML5 + CSS3 + Vanilla JS frontend, Node.js + Express backend
- Glassmorphism dark futuristic aesthetic with neon cyan (#00f5ff) and purple (#bf00ff) accents
- Backend folder: `backend/` with clean architecture (routes/controllers/middleware/config)
- Contact: vegasola8@gmail.com | WhatsApp: +2349061198658 | GitHub: olasubomi-png
