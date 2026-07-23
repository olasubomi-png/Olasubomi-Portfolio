'use strict';

const config = require('../config');

/**
 * Centralised Express error handler.
 * Must be registered LAST with app.use(errorHandler).
 */
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const status = err.status || err.statusCode || 500;
  const isDev  = config.nodeEnv === 'development';

  console.error(`[ERROR] ${req.method} ${req.path} →`, err.message);

  res.status(status).json({
    success: false,
    message: status >= 500 && !isDev
      ? 'Internal server error. Please try again later.'
      : err.message || 'Something went wrong.',
    ...(isDev && { stack: err.stack }),
  });
}

module.exports = errorHandler;
