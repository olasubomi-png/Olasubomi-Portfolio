# Olasubomi — Full-Stack Developer Portfolio

[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?logo=node.js)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express)](https://expressjs.com)
[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)

A production-ready full-stack portfolio — static HTML/CSS/JS frontend served by an Express.js backend, deployable on **AWS EC2 + PM2 + Nginx** with HTTPS via Let's Encrypt.

---

## Table of Contents
1. [Project Structure](#project-structure)
2. [API Reference](#api-reference)
3. [Local Development](#local-development)
4. [Environment Variables](#environment-variables)
5. [AWS EC2 Deployment](#aws-ec2-deployment)
6. [Nginx Setup](#nginx-setup)
7. [PM2 Process Management](#pm2-process-management)
8. [SSL — Let's Encrypt](#ssl--lets-encrypt)
9. [CI / CD (optional)](#ci--cd-optional)
10. [Roadmap](#roadmap)

---

## Project Structure

```
.
├── index.html              # Frontend entry point (SPA)
├── style.css               # All styles (responsive, dark-mode)
├── script.js               # Frontend JS (FAQ, contact form, toasts)
├── images/                 # Static images
├── favicon.svg             # SVG favicon
├── robots.txt              # Search-engine crawl rules
├── sitemap.xml             # XML sitemap (update domain before going live)
├── nginx.conf              # Reference Nginx site config
├── ecosystem.config.js     # PM2 process config
├── .env.example            # Environment variable template
├── .gitignore
├── logs/                   # PM2 log output (created at runtime)
└── backend/
    ├── server.js           # Express app entry point
    ├── package.json
    ├── config/
    │   └── index.js        # Centralised env config
    ├── routes/
    │   ├── contact.js
    │   ├── projects.js
    │   ├── profile.js
    │   └── services.js
    ├── controllers/
    │   ├── contactController.js
    │   ├── projectsController.js
    │   ├── profileController.js
    │   └── servicesController.js
    └── middleware/
        ├── errorHandler.js
        ├── logger.js       # Request logger (method, path, status, ms)
        ├── rateLimiter.js
        └── validator.js
```

---

## API Reference

All endpoints return JSON. Base path: `/api`

| Method | Path              | Description                         |
|--------|-------------------|-------------------------------------|
| GET    | `/api/health`     | Server health check                 |
| GET    | `/api/projects`   | List of portfolio projects          |
| GET    | `/api/profile`    | Profile / about data                |
| GET    | `/api/services`   | Services offered                    |
| POST   | `/api/contact`    | Submit contact form message         |

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

**Success response (200):**
```json
{ "success": true, "message": "Message received! I'll get back to you soon." }
```

**Validation error (422):**
```json
{ "success": false, "message": "Validation failed", "errors": [ ... ] }
```

---

## Local Development

```bash
# 1. Clone
git clone https://github.com/olasubomi-png/Olasubomi-Portfolio.git
cd Olasubomi-Portfolio

# 2. Install backend dependencies
cd backend && npm install && cd ..

# 3. Create your .env (copy the template)
cp .env.example backend/.env
# Edit backend/.env and fill in your values

# 4. Start the server
cd backend && node server.js
# or with auto-reload:
cd backend && npx nodemon server.js
```

Open <http://localhost:3000> in your browser.

---

## Environment Variables

Copy `.env.example` to `backend/.env` and fill in:

| Variable          | Default       | Description                                   |
|-------------------|---------------|-----------------------------------------------|
| `PORT`            | `3000`        | Port the Express server listens on            |
| `NODE_ENV`        | `development` | `development` or `production`                 |
| `ALLOWED_ORIGINS` | `*`           | Comma-separated CORS origins                  |
| `ADMIN_EMAIL`     | —             | Your email address (for contact-form alerts)  |
| `SMTP_HOST`       | —             | SMTP server hostname                          |
| `SMTP_PORT`       | `587`         | SMTP port (587 = STARTTLS, 465 = SSL)         |
| `SMTP_USER`       | —             | SMTP username                                 |
| `SMTP_PASS`       | —             | SMTP password                                 |
| `MONGODB_URI`     | —             | MongoDB connection string (optional)          |
| `SESSION_SECRET`  | —             | Secret for signed session cookies             |

---

## AWS EC2 Deployment

### 1. Provision the server

- **AMI:** Ubuntu 22.04 LTS
- **Instance type:** t3.micro (free tier) or t3.small
- **Security Group inbound rules:**

| Port | Protocol | Source      | Purpose          |
|------|----------|-------------|------------------|
| 22   | TCP      | Your IP     | SSH              |
| 80   | TCP      | 0.0.0.0/0   | HTTP (→ HTTPS)   |
| 443  | TCP      | 0.0.0.0/0   | HTTPS            |

> Ports **3000** and **5000** should remain **closed** to the internet — Nginx proxies to them internally.

### 2. Connect and update

```bash
ssh -i your-key.pem ubuntu@<EC2-PUBLIC-IP>
sudo apt update && sudo apt upgrade -y
```

### 3. Install Node.js 20.x

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v   # should print v20.x.x
```

### 4. Install PM2 and Nginx

```bash
sudo npm install -g pm2
sudo apt install -y nginx
```

### 5. Clone the repository

```bash
sudo mkdir -p /var/www/portfolio
sudo chown $USER:$USER /var/www/portfolio
git clone https://github.com/olasubomi-png/Olasubomi-Portfolio.git /var/www/portfolio
cd /var/www/portfolio
```

### 6. Install dependencies and configure env

```bash
cd backend && npm install --production && cd ..
cp .env.example backend/.env
nano backend/.env   # fill in production values
```

### 7. Update domain placeholders

```bash
# robots.txt and sitemap.xml contain "yourdomain.com" placeholders
sed -i 's|yourdomain.com|olasubomi.dev|g' robots.txt sitemap.xml

# index.html OG/Twitter/canonical tags also contain the placeholder
sed -i 's|yourdomain.com|olasubomi.dev|g' index.html
```

### 8. Create the logs directory

```bash
mkdir -p /var/www/portfolio/logs
```

---

## Nginx Setup

Copy the reference config and enable the site:

```bash
sudo cp /var/www/portfolio/nginx.conf /etc/nginx/sites-available/portfolio

# Edit the file and replace "yourdomain.com" with your real domain
sudo nano /etc/nginx/sites-available/portfolio

# Enable the site
sudo ln -s /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/portfolio

# Remove the default site (optional)
sudo rm -f /etc/nginx/sites-enabled/default

# Test config, then reload
sudo nginx -t && sudo systemctl reload nginx
```

---

## PM2 Process Management

```bash
cd /var/www/portfolio

# Start the app
pm2 start ecosystem.config.js --env production

# Persist across reboots
pm2 save
pm2 startup   # copy-paste the printed command and run it as root

# Useful commands
pm2 status                  # list all processes
pm2 logs portfolio          # tail live logs
pm2 logs portfolio --lines 200  # last 200 log lines
pm2 restart portfolio       # restart
pm2 reload portfolio        # zero-downtime reload
pm2 stop portfolio
pm2 delete portfolio
```

---

## SSL — Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx

# Issue a certificate (Nginx plugin handles the challenge automatically)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is set up by certbot; verify with:
sudo systemctl status certbot.timer

# Test renewal dry-run
sudo certbot renew --dry-run
```

After the cert is issued, Nginx config is updated automatically by Certbot.

---

## CI / CD (optional)

A minimal GitHub Actions workflow for auto-deploy on push to `main`:

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
      - name: SSH & pull
        uses: appleboy/ssh-action@v1.0.3
        with:
          host:     ${{ secrets.EC2_HOST }}
          username: ubuntu
          key:      ${{ secrets.EC2_SSH_KEY }}
          script: |
            cd /var/www/portfolio
            git pull origin main
            cd backend && npm install --production && cd ..
            pm2 reload portfolio
```

Add `EC2_HOST` and `EC2_SSH_KEY` as GitHub repository secrets.

---

## Roadmap

| # | Feature                              | Status      |
|---|--------------------------------------|-------------|
| 1 | Contact-form email alerts (Nodemailer) | Planned   |
| 2 | MongoDB persistence for messages     | Planned     |
| 3 | Real project/gallery screenshots     | Planned     |
| 4 | Blog section (Markdown-based)        | Coming soon |
| 5 | Admin dashboard for messages         | Coming soon |

---

*Built with Node.js passion & deployed on AWS ☁️*
