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

## What NOT to do
- Don't add features not in the spec
- Don't change folder structure without asking
- Don't install new packages without flagging it