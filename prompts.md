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