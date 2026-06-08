// Thin wrapper over the API. Requests go to /api/* and are proxied to the
// Express server in dev (see vite.config.js).
//
// Auth is cookie-based: login sets an httpOnly JWT cookie the browser stores and
// sends automatically. `credentials: 'include'` ensures that cookie rides along
// with every request. JS can't read the cookie (httpOnly) — that's intentional.

const request = async (path, { method = 'GET', body } = {}) => {
  const res = await fetch(`/api${path}`, {
    method,
    credentials: 'include',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
};

// --- Auth ---
export const register = (payload) =>
  request('/auth/register', { method: 'POST', body: payload });

export const login = (payload) =>
  request('/auth/login', { method: 'POST', body: payload });

export const logout = () => request('/auth/logout', { method: 'POST' });

// --- Doubts (identity comes from the cookie, never the client) ---
export const submitDoubt = (doubt) =>
  request('/doubts', { method: 'POST', body: doubt });

export const getMyDoubts = () => request('/doubts/mine');

export const getAllDoubts = () => request('/doubts');

export const resolveDoubt = (doubtId) =>
  request(`/doubts/${doubtId}/resolve`, { method: 'PATCH' });
