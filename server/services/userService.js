const prisma = require('./prismaClient');

// All Prisma access for users lives here (repository pattern).

const findByEmail = (email) => prisma.user.findUnique({ where: { email } });

const createUser = ({ name, email, password, role }) =>
  prisma.user.create({ data: { name, email, password, role } });

module.exports = { findByEmail, createUser };
