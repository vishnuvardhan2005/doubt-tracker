const prisma = require('./prismaClient');

// All Prisma access for doubts lives here (repository pattern).

const createDoubt = ({ question, subject, priority, studentId }) =>
  prisma.doubt.create({
    // priority may be undefined — Prisma then applies the schema default (MEDIUM).
    data: { question, subject, priority, studentId },
  });

const getDoubtsByStudent = (studentId) =>
  prisma.doubt.findMany({
    where: { studentId },
    orderBy: { createdAt: 'desc' },
  });

const getAllDoubts = () =>
  prisma.doubt.findMany({ orderBy: { createdAt: 'desc' } });

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
