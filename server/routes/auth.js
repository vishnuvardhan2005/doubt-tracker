const express = require('express');
const controller = require('../controllers/authController');

const router = express.Router();

const VALID_ROLES = ['STUDENT', 'TEACHER'];
const MIN_PASSWORD_LENGTH = 8;

const isNonEmptyString = (value) =>
  typeof value === 'string' && value.trim().length > 0;

const fail = (res, message, code = 'VALIDATION_ERROR', status = 400) =>
  res.status(status).json({ error: message, code });

// Input validation lives at the route level (before the controller).
const validateRegister = (req, res, next) => {
  const { name, email, password, role } = req.body || {};
  if (!isNonEmptyString(name)) return fail(res, 'name is required');
  if (!isNonEmptyString(email)) return fail(res, 'email is required');
  if (!isNonEmptyString(password) || password.length < MIN_PASSWORD_LENGTH) {
    return fail(res, `password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }
  if (!VALID_ROLES.includes(role)) {
    return fail(res, 'role must be STUDENT or TEACHER');
  }
  return next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body || {};
  if (!isNonEmptyString(email)) return fail(res, 'email is required');
  if (!isNonEmptyString(password)) return fail(res, 'password is required');
  return next();
};

router.post('/register', validateRegister, controller.register);
router.post('/login', validateLogin, controller.login);
router.post('/logout', controller.logout);

module.exports = router;
