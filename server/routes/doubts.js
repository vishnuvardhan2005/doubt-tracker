const express = require('express');
const controller = require('../controllers/doubtController');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

const VALID_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];
const VALID_STATUSES = ['OPEN', 'RESOLVED'];

const isNonEmptyString = (value) =>
  typeof value === 'string' && value.trim().length > 0;

const fail = (res, message, code = 'VALIDATION_ERROR', status = 400) =>
  res.status(status).json({ error: message, code });

// Teacher filters (both optional). Reject unknown enum values rather than
// silently ignoring them, keeping the consistent { error, code } shape.
const validateDoubtFilters = (req, res, next) => {
  const { priority, status } = req.query;
  if (priority !== undefined && !VALID_PRIORITIES.includes(priority)) {
    return fail(res, 'priority must be LOW, MEDIUM or HIGH');
  }
  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    return fail(res, 'status must be OPEN or RESOLVED');
  }
  return next();
};

// Student sort (optional). Only sort=priority is supported.
const validateMineSort = (req, res, next) => {
  const { sort } = req.query;
  if (sort !== undefined && sort !== 'priority') {
    return fail(res, 'sort must be priority');
  }
  return next();
};

const validateCreateDoubt = (req, res, next) => {
  const { question, subject, priority } = req.body || {};
  if (!isNonEmptyString(question)) return fail(res, 'question is required');
  if (!isNonEmptyString(subject)) return fail(res, 'subject is required');
  if (priority !== undefined && !VALID_PRIORITIES.includes(priority)) {
    return fail(res, 'priority must be LOW, MEDIUM or HIGH');
  }
  return next();
};

// Every doubt route is authenticated; identity comes from the JWT (req.user),
// never from the request body. Role access is enforced with requireRole.
router.post(
  '/',
  authenticate,
  requireRole('STUDENT'),
  validateCreateDoubt,
  controller.submitDoubt
);
router.get(
  '/mine',
  authenticate,
  requireRole('STUDENT'),
  validateMineSort,
  controller.getMyDoubts
);
router.get(
  '/',
  authenticate,
  requireRole('TEACHER'),
  validateDoubtFilters,
  controller.getAllDoubts
);
router.patch(
  '/:id/resolve',
  authenticate,
  requireRole('TEACHER'),
  controller.resolveDoubt
);

module.exports = router;
