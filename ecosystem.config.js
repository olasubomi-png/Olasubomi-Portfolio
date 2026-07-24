/**
 * PM2 Ecosystem File — Olasubomi Portfolio
 * Production target: Ubuntu 22.04 AWS EC2, /var/www/html
 *
 * ── First-time setup ──────────────────────────────────────
 *   cd /var/www/html
 *   pm2 start ecosystem.config.js --env production
 *   pm2 save
 *   pm2 startup   # run the printed command as root to enable auto-start on reboot
 *
 * ── Routine deploy (after git pull) ──────────────────────
 *   pm2 restart portfolio-api
 *
 * ── Other useful commands ─────────────────────────────────
 *   pm2 status
 *   pm2 logs portfolio-api
 *   pm2 logs portfolio-api --lines 200
 *   pm2 reload  portfolio-api   # zero-downtime reload
 *   pm2 stop    portfolio-api
 *   pm2 delete  portfolio-api
 */
module.exports = {
  apps: [
    {
      name:   'portfolio-api',     // matches the existing PM2 process name on the server
      script: 'backend/server.js', // relative to cwd below

      /* ── Paths ── */
      cwd: '/var/www/html',        // repo root on the EC2 server

      /* ── Runtime ── */
      instances:          1,       // set to 'max' to use all CPU cores (cluster mode)
      exec_mode:          'fork',
      autorestart:        true,
      watch:              false,   // never enable watch in production
      max_memory_restart: '256M',

      /* ── Logging ── */
      // ~/.pm2/logs/ is created automatically by PM2 when it first runs
      // as the ubuntu user. /var/log/pm2/ requires root and causes
      // "Could not create folder" errors — never use it here.
      error_file:      '/home/ubuntu/.pm2/logs/portfolio-api-error.log',
      out_file:        '/home/ubuntu/.pm2/logs/portfolio-api-out.log',
      log_file:        '/home/ubuntu/.pm2/logs/portfolio-api-combined.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs:      true,

      /* ── Environment ── */
      env: {
        NODE_ENV: 'development',
        PORT:     3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT:     3000,
      },
    },
  ],
};
