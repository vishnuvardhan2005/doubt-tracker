## Phase2

### Scaffold
Read CLAUDE.md and SPEC.md first.

Scaffold the project structure:
- /client: React + Vite + Tailwind (use npm create vite)
- /server: Node + Express with the folder structure defined in CLAUDE.md
- /server: initialise Prisma with the schema from SPEC.md
- Add a root package.json with scripts to run client and server together

Do not build any routes or UI yet. Structure and config only.
Do not install any packages not in CLAUDE.md.

### DB Seed
Add a seed file at server/prisma/seed.ts that creates:
- 1 teacher user (role: TEACHER)
- 2 student users (role: STUDENT)
- 3 doubts submitted by student 1

Hash passwords with bcrypt. Use the Prisma schema as-is, no new fields.

### First Health Check Route
Add a single health check route GET /health that returns 
{ status: "ok" } — nothing else. No auth, no DB.

### Feature API
Read CLAUDE.md and SPEC.md first.

Build the doubts API. Follow the folder structure exactly:
- routes → controllers → services (Prisma calls only in services)
- Input validation at route level
- Consistent error shape: { error: string, code: string }
- No auth middleware yet — we add that in phase 4
- No UI yet

Endpoints to build:
POST   /api/doubts          → student submits a doubt
GET    /api/doubts/mine     → student views their own doubts
GET    /api/doubts          → teacher views all doubts
PATCH  /api/doubts/:id/resolve → teacher marks a doubt resolved

For now, accept userId and role in the request body temporarily.
We'll replace this with JWT in phase 4.

### Error handling middleware
Add a global error handling middleware in 
server/middleware/errorHandler.ts

It should:
- Catch all errors passed via next(err)
- Return { error: string, code: string } always
- Handle Prisma not found errors as 404
- Handle validation errors as 400
- Everything else as 500
- Never expose stack traces in production (check NODE_ENV)

Wire it into server/index.ts as the last middleware.

### Tests
Add API tests using Jest + Supertest in server/tests/doubts.test.ts

For each endpoint write:
1. Happy path — correct input, expected response
2. Failure case — missing field, wrong id, invalid data

Tests to cover:
- POST /api/doubts — valid doubt, missing question, missing subject
- GET /api/doubts/mine — returns only that student's doubts
- GET /api/doubts — returns all doubts
- PATCH /api/doubts/:id/resolve — valid id, non-existent id

Use a separate test database. Add TEST_DATABASE_URL to .env.example
Reset the DB before each test using prisma.$transaction to clean tables.

### Review
Review everything you just built in phase 3.
Check for:
1. Any SOLID violations — functions doing too much
2. Any layer calling another layer it shouldn't
3. Any endpoint that could leak another user's data
4. Any error that could expose internals in production
5. Anything that'll be hard to extend when we add auth in phase 4

List issues found. Fix anything critical before I commit.

### Auth impl
Build JWT auth with httpOnly cookies.

Endpoints needed:
POST /api/auth/register  → name, email, password, role
POST /api/auth/login     → email, password → sets httpOnly cookie
POST /api/auth/logout    → clears the cookie

Middleware:
- authenticate: verifies JWT from cookie, sets req.user = { userId, role, email }
- requireRole(role): checks req.user.role matches required role

Do not touch the doubts API yet. Auth layer only.

### Auth in APIs
Update the doubts API to use auth middleware.

Replace all temporary userId/role from request body with req.user.

Rules:
- All doubt routes require authenticate middleware
- POST /api/doubts         → STUDENT only
- GET  /api/doubts/mine    → STUDENT only, filter by req.user.userId
- GET  /api/doubts         → TEACHER only  
- PATCH /api/doubts/:id/resolve → TEACHER only

Never use userId from request body anywhere in doubts API.

### Auth UI
Update the React UI to add:
- Register page: name, email, password, role selector
- Login page: email, password
- On login success, cookie is set automatically (httpOnly, 
  so JS can't read it — that's correct)
- Remove all temporary userId/role inputs from the UI
- Add a logout button that calls POST /api/auth/logout

### Reviuew
Security review of everything built in phase 4.

Check:
1. Any route missing authenticate middleware
2. Any place userId is read from request body instead of req.user
3. Any place password could appear in a response or log
4. Any place a student could access another student's data
5. Cookie security settings correct for production

List every issue found.

### New Sort feature
A new feature has been added to SPEC.md under 
"Feature: Priority Filter + Sort (v2)". Read it carefully.

Only touch:
- server/routes/doubts.ts
- server/controllers/doubts.ts  
- server/services/doubts.ts
- client src for teacher and student doubt views

Do not touch auth middleware, Prisma schema, 
POST or PATCH endpoints, or any other file.

### New Feature tests
Add tests in server/tests/doubts.test.ts for the new 
filter and sort functionality.

Cover:
- GET /api/doubts?priority=HIGH returns only HIGH doubts
- GET /api/doubts?status=OPEN returns only open doubts  
- GET /api/doubts?priority=HIGH&status=OPEN combines filters
- GET /api/doubts/mine?sort=priority returns HIGH before MEDIUM before LOW
- Invalid priority value returns 400
- Invalid status value returns 400

### New Feature review
Review the priority filter changes.

Check:
1. Anything changed beyond what the spec asked for?
2. Are query params validated — no injection risk?
3. Is sort/filter logic in the service layer, not leaking into controller?
4. Edge cases — empty filters, invalid values, no results?