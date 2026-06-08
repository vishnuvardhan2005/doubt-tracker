const { COOKIE_NAME, verifyToken } = require('../config/jwt');

/*
 * Auth middleware. `authenticate` verifies the JWT from the httpOnly cookie and
 * populates req.user; protected routes then read identity from req.user ONLY,
 * never from client-sent fields (see CLAUDE.md security rules). `requireRole`
 * gates a route to a single role and must be mounted after `authenticate`.
 */

const unauthenticated = (res, message) =>
  res.status(401).json({ error: message, code: 'UNAUTHENTICATED' });

const authenticate = (req, res, next) => {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return unauthenticated(res, 'Authentication required');
  try {
    const { userId, role, email } = verifyToken(token);
    req.user = { userId, role, email };
    return next();
  } catch {
    return unauthenticated(res, 'Invalid or expired session');
  }
};

const requireRole = (role) => (req, res, next) => {
  if (!req.user) return unauthenticated(res, 'Authentication required');
  if (req.user.role !== role) {
    return res
      .status(403)
      .json({ error: 'Insufficient permissions', code: 'FORBIDDEN' });
  }
  return next();
};

module.exports = { authenticate, requireRole };
