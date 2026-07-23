# Olasubomi — Premium Developer Portfolio

> Full-stack developer portfolio with a Node.js/Express REST API backend, glassmorphism UI, particle animations, and production-ready security.

![Portfolio Preview](images/myphoto.png)

---

## ✨ Features

### Frontend
- 🎨 **Glassmorphism** dark/light theme with soft neon glow
- 🌊 **Animated particle canvas** with connecting lines
- ⌨️ **Typing animation** cycling through developer roles
- 📱 **Fully responsive** — mobile-first design
- ♿ **Accessible** — ARIA labels, semantic HTML, keyboard navigation
- ⚡ **Smooth scroll animations** via Intersection Observer API
- 🔍 **SEO optimized** — Open Graph tags, meta descriptions

### Sections
| Section | Description |
|---|---|
| Hero | Intro, social links, CTA buttons, orbit animation |
| Stats | Animated counters |
| About | Bio, expertise cards |
| Skills | Animated progress bars + tech pills |
| Services | 6 professional service cards |
| Projects | 4 project cards (2×2 grid) |
| Testimonials | Client feedback cards |
| Journey | Developer timeline (2021 → Now) |
| Certifications | Credential badges |
| Gallery | Screenshot showcase |
| Blog | Article placeholder cards |
| FAQ | Accessible accordion |
| Contact | Backend-powered form + direct contact cards |

### Backend (Express.js REST API)
- 🔒 **Helmet** — secure HTTP headers
- 🌐 **CORS** — configurable allowed origins
- ⏱️ **Rate limiting** — general + strict contact endpoint
- ✅ **Input validation** — express-validator with field-level errors
- 🏗️ **Clean architecture** — routes / controllers / middleware / config
- 📡 **REST endpoints** — `/api/contact`, `/api/projects`, `/api/profile`, `/api/services`, `/api/health`

---

## 🗂️ Project Structure

```
olasubomi-portfolio/
│
├── index.html              # Main portfolio page
├── style.css               # Glassmorphism CSS (2 themes)
├── script.js               # Vanilla JS — animations, form, FAQ
│
├── images/                 # Profile & gallery images
│   └── myphoto.png
├── assets/
│   └── cv/
│       └── Olasubomi-CV.pdf
│
├── backend/
│   ├── server.js           # Express app entry point
│   ├── package.json
│   ├── config/
│   │   └── index.js        # All env vars in one place
│   ├── routes/
│   │   ├── contact.js
│   │   ├── projects.js
│   │   ├── profile.js
│   │   └── services.js
│   ├── controllers/
│   │   ├── contactController.js
│   │   ├── projectsController.js
│   │   ├── profileController.js
│   │   └── servicesController.js
│   └── middleware/
│       ├── errorHandler.js
│       ├── rateLimiter.js
│       └── validator.js
│
├── .env.example            # Environment variable template
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/olasubomi-png/portfolio.git
cd portfolio
cd backend && npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your values
```

### 3. Run Locally

```bash
cd backend
npm start          # Production
npm run dev        # Development (nodemon)
```

Visit `http://localhost:3000`

---

## 📡 API Endpoints

| Method | Endpoint | Description | Rate Limit |
|---|---|---|---|
| `GET` | `/api/health` | Server health check | General |
| `GET` | `/api/profile` | Public profile data | General |
| `GET` | `/api/projects` | Portfolio projects | General |
| `GET` | `/api/services` | Services offered | General |
| `POST` | `/api/contact` | Contact form submission | 10 req/15 min |

### POST /api/contact — Request Body

```json
{
  "name":    "John Doe",
  "email":   "john@example.com",
  "subject": "WhatsApp Bot Development",
  "message": "Hi Olasubomi, I'd like to build a WhatsApp bot..."
}
```

### POST /api/contact — Response (success)

```json
{
  "success": true,
  "message": "Message received! I'll get back to you within 24 hours."
}
```

---

## ☁️ AWS EC2 Deployment

### 1. Server Setup

```bash
# Update & install Node.js 20
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx

# Install PM2
sudo npm install -g pm2
```

### 2. Clone & Configure

```bash
git clone https://github.com/olasubomi-png/portfolio.git /var/www/portfolio
cd /var/www/portfolio/backend
npm install --production
cp ../.env.example ../.env
nano ../.env   # Set NODE_ENV=production, PORT=3000
```

### 3. PM2 Process Management

```bash
# Start
pm2 start server.js --name portfolio

# Auto-restart on reboot
pm2 startup
pm2 save
```

### 4. Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass         http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### 5. SSL/HTTPS (Certbot)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## 🔒 Security Features

| Feature | Implementation |
|---|---|
| Secure headers | Helmet.js (CSP, HSTS, X-Frame-Options…) |
| CORS | Configurable allowed origins via env |
| Rate limiting | 100 req/15 min general; 10 req/15 min contact |
| Input validation | express-validator with field-level messages |
| Body size limit | 10KB max for JSON and URL-encoded |
| Secrets | Environment variables only — never hardcoded |

---

## 🛣️ Roadmap

- [ ] MongoDB integration for contact form storage
- [ ] Nodemailer email notifications on contact
- [ ] Admin dashboard for managing contacts
- [ ] Blog CMS integration
- [ ] LinkedIn & Twitter social links

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3 (Glassmorphism), Vanilla JS |
| Backend | Node.js 20, Express.js 4 |
| Security | Helmet, CORS, express-rate-limit, express-validator |
| Deploy | AWS EC2, Nginx, PM2 |
| Database (ready) | MongoDB (via MONGODB_URI env) |

---

## 📄 License

MIT — Feel free to fork and adapt for your own portfolio.

---

*Built with Node.js passion & deployed on AWS ☁️ — Olasubomi*
