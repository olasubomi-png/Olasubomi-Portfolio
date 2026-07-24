# Olasubomi Portfolio Platform

A full-stack portfolio + platform built with Node.js, Express, MongoDB, and vanilla HTML/CSS/JS. Deployed on AWS EC2 with Nginx + PM2.

---

## Architecture

```
/
├── index.html            ← Main portfolio landing page (SPA)
├── style.css             ← Portfolio styles
├── script.js             ← Portfolio JS (FAQ, contact form, animations)
├── favicon.svg
├── robots.txt / sitemap.xml

├── auth/                 ← Auth pages (Phase 1)
│   ├── login.html
│   ├── register.html
│   ├── forgot-password.html
│   ├── reset-password.html
│   └── verify-email.html

├── dashboard/            ← User dashboard (Phase 1)
│   └── index.html

├── assets/
│   ├── css/
│   │   ├── auth.css        ← Shared auth page styles
│   │   └── dashboard.css   ← Dashboard styles
│   ├── js/
│   │   ├── auth.js         ← Auth page logic
│   │   └── dashboard.js    ← Dashboard logic
│   ├── cv/
│   │   └── Olasubomi-CV.pdf
│   ├── images/
│   └── uploads/            ← User uploads (gitignored)
│       ├── avatars/
│       ├── products/
│       └── resumes/

├── backend/
│   ├── server.js           ← Express entry point
│   ├── config/index.js     ← Centralised env config
│   ├── models/
│   │   └── User.js         ← Mongoose User model (Phase 1)
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── contactController.js
│   │   ├── projectsController.js
│   │   ├── profileController.js
│   │   └── servicesController.js
│   ├── routes/
│   │   ├── auth.js         ← /api/auth/*
│   │   ├── contact.js
│   │   ├── projects.js
│   │   ├── profile.js
│   │   └── services.js
│   ├── middleware/
│   │   ├── authMiddleware.js  ← JWT protect / restrictTo
│   │   ├── upload.js          ← Multer config
│   │   ├── errorHandler.js
│   │   ├── logger.js
│   │   ├── rateLimiter.js
│   │   └── validator.js
│   └── utils/
│       ├── jwt.js         ← Token generation & cookies
│       └── email.js       ← Nodemailer templates

├── .env.example           ← Copy to .env and fill values
├── ecosystem.config.js    ← PM2 config
└── nginx.conf             ← Nginx site config
```

---

## Running on Replit

The "Start application" workflow runs:
```
cd backend && PORT=5000 node server.js
```

The server serves static files from the repo root and the API at `/api`.

---

## Environment Variables

Copy `.env.example` to `.env` and fill in:

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | **Yes** (for auth) | MongoDB Atlas or self-hosted connection string |
| `JWT_ACCESS_SECRET` | **Yes** | 64-char random string |
| `JWT_REFRESH_SECRET` | **Yes** | 64-char random string (different from access) |
| `CLIENT_URL` | Yes | Full public URL of the app (used in email links) |
| `SMTP_HOST` | No | SMTP server (email falls back to console if blank) |
| `SMTP_USER` | No | SMTP username |
| `SMTP_PASS` | No | SMTP password / app password |
| `PORT` | No | Default 3000 (Replit uses 5000) |

Generate JWT secrets:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## API Endpoints

### Auth (`/api/auth`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | Public | Create account |
| POST | `/login` | Public | Login, sets JWT cookies |
| POST | `/logout` | Public | Clear cookies + revoke token |
| GET  | `/verify-email/:token` | Public | Verify email (redirect) |
| POST | `/resend-verification` | Public | Resend verification email |
| POST | `/forgot-password` | Public | Send reset email |
| POST | `/reset-password/:token` | Public | Reset password |
| POST | `/refresh` | Public | Rotate refresh token |
| GET  | `/me` | 🔒 JWT | Get current user |
| PATCH | `/profile` | 🔒 JWT | Update profile |
| PATCH | `/avatar` | 🔒 JWT | Upload avatar (multipart) |
| PATCH | `/change-password` | 🔒 JWT | Change password |

### Public portfolio API
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/profile` | Portfolio owner profile |
| GET | `/api/projects` | Projects list |
| GET | `/api/services` | Services list |
| POST | `/api/contact` | Contact form |
| GET | `/api/health` | Health check (includes DB status) |

---

## Phase Progress

| Phase | Feature | Status |
|---|---|---|
| 1 | Authentication (register/login/JWT/email verify/reset/dashboard) | ✅ Done |
| 2 | Portfolio Builder | 📋 Planned |
| 3 | Student Marketplace | 📋 Planned |
| 4 | Digital Products Marketplace | 📋 Planned |
| 5 | User Dashboard (full) | 🔄 Shell ready |
| 6 | Admin Panel | 📋 Planned |
| 7 | AI Features | 📋 Planned |
| 8 | Analytics | 📋 Planned |
| 9 | Notifications | 📋 Planned |
| 10 | Messaging | 📋 Planned |
| 11 | Performance & hardening | 📋 Planned |

---

## User Preferences

- Keep existing portfolio page intact — extend only, never replace
- Production deployment: AWS EC2, Nginx, PM2, Node.js (no Docker)
- Mobile responsive on all new pages
- Glassmorphism design language throughout
- Fonts: Orbitron (headings/logo), Inter (body), JetBrains Mono (code/mono)
- MongoDB for persistence; Paystack + Flutterwave for payments (Phase 4)
- AI adapter pattern (OpenAI/Gemini interchangeable) for Phase 7
