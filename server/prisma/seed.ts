// Run with: npm run db:seed  (relies on Node's native TypeScript support, v23.6+)
// CommonJS to match the rest of the server (package.json has no "type": "module").
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const logger = require('../config/logger');
const prisma = new PrismaClient();

const SALT_ROUNDS = 10;
const DEFAULT_PASSWORD = 'password123';

type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
type Status = 'OPEN' | 'RESOLVED';

async function main(): Promise<void> {
  const password = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);

  // Users — upsert on the unique email so the seed is idempotent.
  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@doubttracker.test' },
    update: {},
    create: {
      name: 'Tara Teacher',
      email: 'teacher@doubttracker.test',
      password,
      role: 'TEACHER',
    },
  });

  const student1 = await prisma.user.upsert({
    where: { email: 'sam@doubttracker.test' },
    update: {},
    create: {
      name: 'Sam Student',
      email: 'sam@doubttracker.test',
      password,
      role: 'STUDENT',
    },
  });

  await prisma.user.upsert({
    where: { email: 'riya@doubttracker.test' },
    update: {},
    create: {
      name: 'Riya Student',
      email: 'riya@doubttracker.test',
      password,
      role: 'STUDENT',
    },
  });

  // Doubts have no natural unique key, so clear student1's existing doubts
  // before reseeding to keep this script idempotent.
  await prisma.doubt.deleteMany({ where: { studentId: student1.id } });

  const doubts: {
    question: string;
    subject: string;
    priority: Priority;
    status: Status;
    resolvedBy: string | null;
  }[] = [
    {
      question: 'Why does my recursive function cause a stack overflow?',
      subject: 'Computer Science',
      priority: 'HIGH',
      status: 'OPEN',
      resolvedBy: null,
    },
    {
      question: 'How do I solve an integral using integration by parts?',
      subject: 'Maths',
      priority: 'MEDIUM',
      status: 'OPEN',
      resolvedBy: null,
    },
    {
      question: 'What is the difference between velocity and acceleration?',
      subject: 'Physics',
      priority: 'LOW',
      status: 'RESOLVED',
      resolvedBy: teacher.id,
    },
  ];

  for (const doubt of doubts) {
    await prisma.doubt.create({
      data: { ...doubt, studentId: student1.id },
    });
  }

  logger.info(
    `Seeded ${doubts.length} doubts for ${student1.email} ` +
      `(1 teacher, 2 students total).`
  );
}

main()
  .catch((error) => {
    logger.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
