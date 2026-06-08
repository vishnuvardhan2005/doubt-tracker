const { PrismaClient } = require('@prisma/client');

// Single shared Prisma client. All DB access in /services imports this — never
// instantiate PrismaClient or call it from routes/controllers (see CLAUDE.md).
const prisma = new PrismaClient();

module.exports = prisma;
