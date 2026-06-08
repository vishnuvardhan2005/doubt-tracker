const express = require('express');
const controller = require('../controllers/doubtController');

const router = express.Router();

const VALID_ROLES = ['STUDENT', 'TEACHER'];
const VALID_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];

const isNonEmptyString = (value) =>
  typeof value === 'string' && value.trim().length > 0;

const fail = (res, message, code = 'VALIDATION_ERROR', status = 400) =>
  res.status(status).json({ error: message, code });

// PHASE 3 TEMPORARY: actor (userId + role) comes from the body (tests/tools) or
// the query string (browser GET requests, which cannot carry a body). The
// resolved actor is stashed on req.actor. Phase 4 replaces this with the JWT
// auth middleware populating req.actor from the verified token.
const validateActor = (req, res, next) => {
  const userId = req.body?.userId ?? req.query?.userId;
  const role = req.body?.role ?? req.query?.role;
  if (!isNonEmptyString(userId)) return fail(res, 'userId is required');
  if (!VALID_ROLES.includes(role)) {
    return fail(res, 'role must be STUDENT or TEACHER');
  }
  req.actor = { userId, role };
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

router.post('/', validateActor, validateCreateDoubt, controller.submitDoubt);
router.get('/mine', validateActor, controller.getMyDoubts);
router.get('/', validateActor, controller.getAllDoubts);
router.patch('/:id/resolve', validateActor, controller.resolveDoubt);

module.exports = router;
