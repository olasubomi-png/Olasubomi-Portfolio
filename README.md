# Olasubomi — Full-Stack Developer Portfolio

[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?logo=node.js)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express)](https://expressjs.com)
[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)

Production-ready full-stack portfolio deployed on **AWS EC2** with **Nginx + PM2 + Node.js**.

- **Frontend** — Static HTML/CSS/JS served directly by Nginx from `/var/www/html`
- **Backend** — Express REST API managed by PM2, listening on `127.0.0.1:3000`
- **Nginx** — Reverse-proxies `/api/*` to Express; serves everything else as static files

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [API Reference](#api-reference)
3. [Environment Variables](#environment-variables)
4. [Local Development](#local-development)
5. [AWS EC2 Deployment](#aws-ec2-deployment)
6. [Routine Deploy (after git pull)](#routine-deploy-after-git-pull)
7. [Nginx Configuration](#nginx-configuration)
8. [PM2 Process Management](#pm2-process-management)
9. [Optional: Add HTTPS](#optional-add-https)
10. [CI / CD (GitHub Actions)](#ci--cd-github-actions)
11. [Roadmap](#roadmap)

---

## Project Structure

```
/var/www/html/                  ← repo root on the server
├── index.html                  # Frontend SPA entry point
├── style.css                   # All styles (responsive, dark-mode)
├── script.js                   # Frontend JS (FAQ, contact form, toasts)
├── images/                     # Static images
├── favicon.svg                 # SVG favicon
├── robots.txt                  # Search-engine crawl rules
├── sitemap.xml                 # XML sitemap
├── nginx.conf                  # Nginx site config (copy to sites-available/default)
├── ecosystem.config.js         # PM2 process config
├── .env                        # Secret env vars — NOT committed (see .env.example)
├── .env.example                # Template — copy to .env and fill in
├── .gitignore
└── backend/
    ├── server.js               # Express entry point
    ├── package.json
    ├── config/index.js         # Centralised env config (reads ../.env)
    ├── routes/                 # contact · projects · profile · services
    ├── controllers/            # Business logic for each route
    └── middleware/
        ├── errorHandler.js
        ├── logger.js           # Coloured request logger
        ├── rateLimiter.js
        └── validator.js
```

---

## API Reference

All endpoints return JSON. Base path: `/api`

| Method | Path              | Description                  |
|--------|-------------------|------------------------------|
| GET    | `/api/health`     | Server health check          |
| GET    | `/api/projects`   | Portfolio project list       |
| GET    | `/api/profile`    | Profile / about data         |
| GET    | `/api/services`   | Services offered             |
| POST   | `/api/contact`    | Submit contact form message  |

### POST `/api/contact`

**Request body (JSON):**
```json
{
  "name":    "Jane Doe",
  "email":   "jane@example.com",
  "subject": "Project Enquiry",
  "message": "I'd like to discuss a project..."
}
```

**Success (200):**
```json
{ "success": true, "message": "Message received! I'll get back to you soon." }
```

**Validation error (422):**
```json
{ "success": false, "message": "Validation failed.", "errors": [ ... ] }
```

---

## Environment Variables

The app reads `.env` from the **repo root** (`/var/www/html/.env`).

```bash
# On the server:
cp .env.example .env
nano .env   # fill in your values
```

| Variable          | Default          | Description                                 |
|-------------------|------------------|---------------------------------------------|
| `PORT`            | `3000`           | Port Express listens on                     |
| `NODE_ENV`        | `development`    | Set to `production` on the server           |
| `ALLOWED_ORIGINS` | `*`              | Comma-separated CORS origins                |
| `ADMIN_EMAIL`     | —                | Your email (for contact-form alerts)        |
| `SMTP_HOST`       | —                | SMTP hostname (e.g. `smtp.gmail.com`)       |
| `SMTP_PORT`       | `587`            | SMTP port (587 = STARTTLS, 465 = SSL)       |
| `SMTP_USER`       | —                | SMTP username                               |
| `SMTP_PASS`       | —                | SMTP app password                           |
| `MONGODB_URI`     | —                | MongoDB connection string (future use)      |

> **Never commit `.env`** — it is in `.gitignore`.

---

## Local Development

```bash
# Clone
git clone https://github.com/olasubomi-png/Olasubomi-Portfolio.git
cd Olasubomi-Portfolio

# Install backend dependencies
cd backend && npm install && cd ..

# Create .env at the repo root
cp .env.example .env   # edit if needed

# Start the server (serves frontend + API on port 3000)
cd backend && node server.js

# With auto-reload during development:
cd backend && npx nodemon server.js
```

Open <http://localhost:3000> — Express serves the frontend and API together for local dev.

---

## AWS EC2 Deployment

### 1. Provision the instance

- **AMI:** Ubuntu 22.04 LTS
- **Instance type:** t3.micro (free tier) or larger
- **Security Group inbound rules:**

| Port | Protocol | Source    | Purpose                    |
|------|----------|-----------|----------------------------|
| 22   | TCP      | Your IP   | SSH                        |
| 80   | TCP      | 0.0.0.0/0 | HTTP                       |
| 443  | TCP      | 0.0.0.0/0 | HTTPS (when you add SSL)   |

> **Keep port 3000 closed** — only Nginx (localhost) talks to Express.

### 2. Connect and update

```bash
ssh -i your-key.pem ubuntu@<EC2-PUBLIC-IP>
sudo apt update && sudo apt upgrade -y
```

### 3. Install Node.js 20.x

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v   # v20.x.x
```

### 4. Install PM2 and Nginx

```bash
sudo npm install -g pm2
sudo apt install -y nginx
```

### 5. Clone the repository

```bash
sudo mkdir -p /var/www/html
sudo chown $USER:$USER /var/www/html
git clone https://github.com/olasubomi-png/Olasubomi-Portfolio.git /var/www/html
cd /var/www/html
```

### 6. Create the `.env` file

```bash
cp .env.example .env
nano .env   # set NODE_ENV=production and fill in your values
```

### 7. Install dependencies and start PM2

```bash
cd backend && npm install --production && cd ..

pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup   # copy-paste the printed command and run it as root
```

### 8. Deploy Nginx config

```bash
sudo cp nginx.conf /etc/nginx/sites-available/default
sudo nginx -t
sudo systemctl reload nginx
```

### 9. Update domain/sitemap placeholders

Once your domain is pointing at the server:

```bash
# Update robots.txt, sitemap.xml, and index.html in one pass
sed -i 's|yourdomain.com|olasubomi.dev|g' robots.txt sitemap.xml index.html

# Also uncomment and set server_name in nginx.conf:
sudo nano /etc/nginx/sites-available/default
# Change:  server_name _;
# To:      server_name olasubomi.dev www.olasubomi.dev;

sudo nginx -t && sudo systemctl reload nginx
```

---

## Routine Deploy (after git pull)

```bash
cd /var/www/html
git pull origin main
cd backend && npm install --production && cd ..
pm2 restart portfolio-api
sudo cp nginx.conf /etc/nginx/sites-available/default
sudo nginx -t
sudo systemctl reload nginx
```

> If `nginx.conf` did not change, skip the last three lines.

---

## Nginx Configuration

The `nginx.conf` in the repo root is the full site config:

| Concern             | Detail                                             |
|---------------------|----------------------------------------------------|
| Static root         | `/var/www/html`                                    |
| API proxy           | `location /api/ → http://127.0.0.1:3000`          |
| SPA fallback        | `try_files $uri $uri/ /index.html`                 |
| Gzip                | Enabled for HTML, CSS, JS, JSON, SVG, fonts        |
| Asset caching       | CSS/JS/images: `Cache-Control: public, immutable, max-age=1y` |
| Security headers    | X-Frame-Options, X-Content-Type-Options, XSS-Protection, Referrer-Policy |

---

## PM2 Process Management

```bash
pm2 status                          # list all processes
pm2 logs portfolio-api              # live log tail
pm2 logs portfolio-api --lines 200  # last 200 lines
pm2 restart portfolio-api           # restart
pm2 reload  portfolio-api           # zero-downtime reload
pm2 stop    portfolio-api
pm2 delete  portfolio-api
```

Log files are written to `/var/log/pm2/`:
- `portfolio-api-out.log`
- `portfolio-api-error.log`
- `portfolio-api-combined.log`

---

## Optional: Add HTTPS

Once your domain is pointed at the server and port 443 is open:

```bash
sudo apt install -y certbot python3-certbot-nginx

# Issue certificate — certbot edits nginx.conf automatically
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Reload after certbot finishes
sudo systemctl reload nginx

# Test auto-renewal
sudo certbot renew --dry-run
```

---

## CI / CD (GitHub Actions)

Auto-deploy on every push to `main`:

```yaml
# .github/workflows/deploy.yml
name: Deploy to EC2

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: SSH and deploy
        uses: appleboy/ssh-action@v1.0.3
        with:
          host:     ${{ secrets.EC2_HOST }}
          username: ubuntu
          key:      ${{ secrets.EC2_SSH_KEY }}
          script: |
            cd /var/www/html
            git pull origin main
            cd backend && npm install --production && cd ..
            pm2 restart portfolio-api
```

Add `EC2_HOST` (public IP) and `EC2_SSH_KEY` (private key contents) as GitHub repository secrets.

---

## Roadmap

| # | Feature                               | Status      |
|---|---------------------------------------|-------------|
| 1 | Contact-form email alerts (Nodemailer) | Planned    |
| 2 | MongoDB persistence for messages      | Planned     |
| 3 | Real project / gallery screenshots    | Planned     |
| 4 | Blog section (Markdown-based)         | Coming soon |
| 5 | Admin dashboard for messages          | Coming soon |

---

*Built with Node.js passion & deployed on AWS ☁️*
