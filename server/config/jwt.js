const jwt = require('jsonwebtoken');

/*
 * Central JWT + auth-cookie config. Signing (login) and verifying (auth
 * middleware) both go through here so the secret, TTL and cookie name are
 * defined in exactly one place.
 */

const COOKIE_NAME = 'token';
const TOKEN_TTL_SECONDS = 60 * 60 * 24; // 1 day

// Read the secret at call time, not import time, so the --env-file flag has
// already populated process.env. Fail loudly rather than sign/verify with
// `undefined` (which jsonwebtoken would otherwise accept).
const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set');
  return secret;
};

const signToken = (payload) =>
  jwt.sign(payload, getSecret(), { expiresIn: TOKEN_TTL_SECONDS });

const verifyToken = (token) => jwt.verify(token, getSecret());

// Flags for the auth cookie:
// - httpOnly: JS can't read it (XSS can't steal the token)
// - sameSite lax: basic CSRF mitigation
// - secure: HTTPS-only in production; off in dev so http://localhost works
const cookieOptions = () => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: TOKEN_TTL_SECONDS * 1000,
});

module.exports = { COOKIE_NAME, signToken, verifyToken, cookieOptions };
