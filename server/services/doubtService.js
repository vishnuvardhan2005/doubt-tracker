const prisma = require('./prismaClient');

// All Prisma access for doubts lives here (repository pattern).

const createDoubt = ({ question, subject, priority, studentId }) =>
  prisma.doubt.create({
    // priority may be undefined — Prisma then applies the schema default (MEDIUM).
    data: { question, subject, priority, studentId },
  });

const getDoubtsByStudent = (studentId, { sortByPriority = false } = {}) =>
  prisma.doubt.findMany({
    where: { studentId },
    // The Priority enum is declared LOW, MEDIUM, HIGH, so 'desc' orders
    // HIGH → MEDIUM → LOW. createdAt is the tiebreaker (and the default sort).
    orderBy: sortByPriority
      ? [{ priority: 'desc' }, { createdAt: 'desc' }]
      : { createdAt: 'desc' },
  });

const getAllDoubts = ({ priority, status } = {}) =>
  prisma.doubt.findMany({
    // Only defined filters are applied; an undefined key is left out entirely.
    where: {
      ...(priority ? { priority } : {}),
      ...(status ? { status } : {}),
    },
    orderBy: { createdAt: 'desc' },
    // Only the student's name is exposed — never email/password.
    include: { student: { select: { id: true, name: true } } },
  });

const getDoubtById = (id) => prisma.doubt.findUnique({ where: { id } });

const resolveDoubt = (id, resolvedBy) =>
  prisma.doubt.update({
    where: { id },
    data: { status: 'RESOLVED', resolvedBy },
  });

module.exports = {
  createDoubt,
  getDoubtsByStudent,
  getAllDoubts,
  getDoubtById,
  resolveDoubt,
};
