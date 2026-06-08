const express = require('express');
const controller = require('../controllers/doubtController');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

const VALID_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];

const isNonEmptyString = (value) =>
  typeof value === 'string' && value.trim().length > 0;

const fail = (res, message, code = 'VALIDATION_ERROR', status = 400) =>
  res.status(status).json({ error: message, code });

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
router.get('/mine', authenticate, requireRole('STUDENT'), controller.getMyDoubts);
router.get('/', authenticate, requireRole('TEACHER'), controller.getAllDoubts);
router.patch(
  '/:id/resolve',
  authenticate,
  requireRole('TEACHER'),
  controller.resolveDoubt
);

module.exports = router;
