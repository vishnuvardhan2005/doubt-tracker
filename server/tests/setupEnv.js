// Runs (via Jest `setupFiles`) before each test file is imported, so the Prisma
// client singleton is constructed against the TEST database — never dev/prod.
// This guard is the safety net that prevents the beforeEach table-wipe from ever
// touching the real database.
if (!process.env.TEST_DATABASE_URL) {
  throw new Error(
    'TEST_DATABASE_URL is not set. Point it at a SEPARATE test database before ' +
      'running tests (see server/.env.example).'
  );
}

process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
process.env.NODE_ENV = 'test';
