/**
 * PM2 Ecosystem File — Olasubomi Portfolio
 *
 * Usage on the AWS EC2 server:
 *   pm2 start ecosystem.config.js --env production
 *   pm2 save
 *   pm2 startup   # follow the printed command to enable auto-start on reboot
 *
 * Common commands:
 *   pm2 status
 *   pm2 logs portfolio
 *   pm2 restart portfolio
 *   pm2 reload portfolio   # zero-downtime reload
 *   pm2 stop portfolio
 *   pm2 delete portfolio
 */
module.exports = {
  apps: [
    {
      name:   'portfolio',
      script: 'backend/server.js',

      /* ── Runtime ── */
      instances:            1,          // increase to 'max' for cluster mode
      exec_mode:            'fork',
      autorestart:          true,
      watch:                false,       // never watch in production
      max_memory_restart:   '256M',

      /* ── Logging ── */
      error_file:  './logs/pm2-error.log',
      out_file:    './logs/pm2-out.log',
      log_file:    './logs/pm2-combined.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs:  true,

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
