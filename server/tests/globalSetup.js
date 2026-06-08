const { execSync } = require('node:child_process');

// Runs once before the whole suite: sync the Prisma schema to the test database
// so the tables exist. Scoped to TEST_DATABASE_URL only.
module.exports = async () => {
  const url = process.env.TEST_DATABASE_URL;
  if (!url) {
    throw new Error(
      'TEST_DATABASE_URL is not set. Point it at a SEPARATE test database before ' +
        'running tests (see server/.env.example).'
    );
  }

  execSync('npx prisma db push --skip-generate --accept-data-loss', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: url },
  });
};
