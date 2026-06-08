const logger = require('../config/logger');

// 404 handler — mounted after all routes.
const notFound = (req, res) => {
  res.status(404).json({ error: 'Resource not found', code: 'NOT_FOUND' });
};

// Central error handler — always returns the consistent { error, code } shape.
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  logger.error(err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal server error',
    code: err.code || 'INTERNAL_ERROR',
  });
};

module.exports = { notFound, errorHandler };
