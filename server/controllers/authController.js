const bcrypt = require('bcrypt');
const userService = require('../services/userService');
const { COOKIE_NAME, signToken, cookieOptions } = require('../config/jwt');

const BCRYPT_ROUNDS = 10;

// Never expose the password hash (or any field) the client shouldn't see.
const toPublicUser = ({ id, name, email, role }) => ({ id, name, email, role });

const register = async (req, res, next) => {
  const { name, email, password, role } = req.body;
  try {
    const existing = await userService.findByEmail(email);
    if (existing) {
      return res
        .status(409)
        .json({ error: 'Email already registered', code: 'EMAIL_TAKEN' });
    }
    const hashed = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await userService.createUser({
      name,
      email,
      password: hashed,
      role,
    });
    return res.status(201).json({ user: toPublicUser(user) });
  } catch (err) {
    return next(err);
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await userService.findByEmail(email);
    // Identical response whether the email is unknown or the password is wrong,
    // so we don't reveal which emails are registered.
    const ok = user && (await bcrypt.compare(password, user.password));
    if (!ok) {
      return res.status(401).json({
        error: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS',
      });
    }
    // Token carries only identity claims — never the password.
    const token = signToken({
      userId: user.id,
      role: user.role,
      email: user.email,
    });
    res.cookie(COOKIE_NAME, token, cookieOptions());
    return res.json({ user: toPublicUser(user) });
  } catch (err) {
    return next(err);
  }
};

const logout = (req, res) => {
  // clearCookie must match the original cookie's flags (sans maxAge) to clear it.
  const { maxAge, ...clearOptions } = cookieOptions();
  res.clearCookie(COOKIE_NAME, clearOptions);
  return res.json({ ok: true });
};

module.exports = { register, login, logout };
