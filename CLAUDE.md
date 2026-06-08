# Doubt Tracker — Claude Context

## Stack
- Frontend: React + Vite + Tailwind
- Backend: Node + Express
- Database: PostgreSQL + Prisma
- Auth: JWT (access token only, stored in httpOnly cookie)
- Testing: Jest + Supertest

## Folder structure
/client        → React frontend
/server        → Express backend
  /routes      → route definitions only
  /controllers → business logic
  /middleware  → auth, error handling
  /services    → DB access via Prisma (repository pattern)
  /tests       → API tests

## Approved dependencies
Only these packages may be used. Adding anything else must be flagged first.

Runtime:
- express, @prisma/client, jsonwebtoken, bcrypt, cookie-parser (server)
- react, react-dom (client)

Dev:
- prisma, jest, supertest, ts-jest, typescript, @types/* (server)
- vite, @vitejs/plugin-react, tailwindcss, @tailwindcss/vite, eslint + plugins (client)
- concurrently (root — runs client + server together)

Env files live in /server (.env, .env.example) — they hold backend-only secrets.
Logging goes through /server/config/logger.js (no console.log elsewhere).

## Coding conventions
- One responsibility per function
- Input validation at route level (before controller)
- All DB access goes through /services — never call Prisma directly from routes or controllers
- Always return consistent error shapes: { error: string, code: string }
- No console.log in production code — use a logger

## Security rules
- Never trust client-sent userId — always read from JWT token
- Always filter data by userId for student-facing endpoints
- Validate JWT on every protected route via auth middleware
- Never commit .env — use .env.example with placeholder values
- Passwords always hashed with bcrypt before storing

## Auth implementation
- JWT stored in httpOnly cookie — never localStorage
- Token contains: userId, role, email
- Never trust client-sent userId — always read from req.user (set by auth middleware)
- Auth middleware sets req.user from token — all protected routes use this
- Two roles: STUDENT, TEACHER
- Passwords hashed with bcrypt, never logged or returned in responses

## What NOT to do
- Don't add features not in the spec
- Don't change folder structure without asking
- Don't install new packages without flagging it