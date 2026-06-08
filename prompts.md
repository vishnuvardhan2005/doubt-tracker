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