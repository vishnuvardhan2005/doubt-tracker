const { Prisma } = require('@prisma/client');
const logger = require('../config/logger');

// Internals (stack traces) are exposed only when explicitly in a dev/test env.
// Anything else — including an unset or misconfigured NODE_ENV in production —
// fails safe and hides them.
const exposeInternals = () =>
  process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';

// 404 handler — mounted after all routes, before the error handler.
const notFound = (req, res) => {
  res.status(404).json({ error: 'Resource not found', code: 'NOT_FOUND' });
};

// Maps any forwarded error to a safe { status, code, message } triple.
const classify = (err) => {
  // Prisma "record not found" (e.g. update/delete targeting a missing row).
  if (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === 'P2025'
  ) {
    return { status: 404, code: 'NOT_FOUND', message: 'Resource not found' };
  }

  // Invalid query/data shape rejected by Prisma.
  if (err instanceof Prisma.PrismaClientValidationError) {
    return { status: 400, code: 'VALIDATION_ERROR', message: 'Invalid request data' };
  }

  // Errors that flag themselves as validation failures.
  if (err.code === 'VALIDATION_ERROR' || err.name === 'ValidationError') {
    return {
      status: 400,
      code: 'VALIDATION_ERROR',
      message: err.message || 'Invalid request data',
    };
  }

  // Respect an explicit HTTP status set by application code. Only client-error
  // (4xx) messages are echoed back; 5xx messages may carry internals, so they
  // are replaced with a generic string.
  if (typeof err.status === 'number') {
    const safeMessage =
      err.status < 500 ? err.message || 'Request failed' : 'Internal server error';
    return { status: err.status, code: err.code || 'ERROR', message: safeMessage };
  }

  // Everything else is an unexpected server error.
  return { status: 500, code: 'INTERNAL_ERROR', message: 'Internal server error' };
};

// Central error handler — catches everything passed via next(err) and always
// responds with the consistent { error, code } shape.
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const { status, code, message } = classify(err);

  // The full error (incl. stack) is only ever logged server-side.
  logger.error(err);

  const body = { error: message, code };

  // Stack traces are surfaced only in an explicit dev/test env — never in prod
  // and never when NODE_ENV is unset (fail safe).
  if (exposeInternals() && err.stack) {
    body.stack = err.stack;
  }

  res.status(status).json(body);
};

module.exports = { notFound, errorHandler };
