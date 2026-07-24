'use strict';

/**
 * Lightweight HTTP request logger.
 * Logs method, path, status code, and response time to stdout.
 * Health-check pings are silenced in production to reduce noise.
 */
function logger(req, res, next) {
  // Skip health-check spam in production
  if (req.path === '/api/health' && process.env.NODE_ENV === 'production') {
    return next();
  }

  const start = Date.now();

  res.on('finish', () => {
    const ms     = Date.now() - start;
    const status = res.statusCode;

    /* ANSI colour codes */
    const colour = status >= 500 ? '\x1b[31m'   // red
                 : status >= 400 ? '\x1b[33m'   // yellow
                 : status >= 300 ? '\x1b[36m'   // cyan
                 :                 '\x1b[32m';  // green
    const reset  = '\x1b[0m';

    const ts  = new Date().toISOString();
    const ip  = req.ip || req.socket.remoteAddress || '-';
    console.log(`${ts} ${colour}${status}${reset} ${req.method} ${req.path} — ${ms}ms [${ip}]`);
  });

  next();
}

module.exports = logger;
