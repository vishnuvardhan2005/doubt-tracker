// Thin wrapper over the doubts API. Requests go to /api/* and are proxied to the
// Express server in dev (see vite.config.js).
//
// PHASE 3 TEMPORARY: the actor (userId + role) is passed as query params. GET
// requests can't carry a body in the browser, so we use the query string
// uniformly. Phase 4 replaces this with the JWT cookie set at login.

const request = async (path, { method = 'GET', body } = {}) => {
  const res = await fetch(`/api${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
};

const actor = (userId, role) =>
  `?userId=${encodeURIComponent(userId)}&role=${encodeURIComponent(role)}`;

export const submitDoubt = (userId, doubt) =>
  request(`/doubts${actor(userId, 'STUDENT')}`, { method: 'POST', body: doubt });

export const getMyDoubts = (userId) =>
  request(`/doubts/mine${actor(userId, 'STUDENT')}`);

export const getAllDoubts = (teacherId) =>
  request(`/doubts${actor(teacherId, 'TEACHER')}`);

export const resolveDoubt = (doubtId, teacherId) =>
  request(`/doubts/${doubtId}/resolve${actor(teacherId, 'TEACHER')}`, {
    method: 'PATCH',
  });
