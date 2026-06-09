import request from 'supertest';
import app from '../app';
import prisma from '../services/prismaClient';
const { signToken, COOKIE_NAME } = require('../config/jwt');

type Role = 'STUDENT' | 'TEACHER';
type User = { id: string; role: Role; email: string };

const createUser = (role: Role, email: string) =>
  prisma.user.create({
    data: {
      name: `${role.toLowerCase()} ${email}`,
      email,
      password: 'hashed-placeholder',
      role,
    },
  });

// Mint the same httpOnly auth cookie the login endpoint would set, so requests
// carry a verified identity exactly as they do in production.
const authCookie = (user: User) => [
  `${COOKIE_NAME}=${signToken({
    userId: user.id,
    role: user.role,
    email: user.email,
  })}`,
];

beforeEach(async () => {
  // Reset the test DB before every test. Doubts first — they FK to users.
  await prisma.$transaction([
    prisma.doubt.deleteMany(),
    prisma.user.deleteMany(),
  ]);
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('POST /api/doubts', () => {
  it('creates a doubt for a student (happy path)', async () => {
    const student = await createUser('STUDENT', 'student@test.dev');

    const res = await request(app)
      .post('/api/doubts')
      .set('Cookie', authCookie(student))
      .send({
        question: 'Why does recursion overflow the stack?',
        subject: 'Computer Science',
        priority: 'HIGH',
      });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      question: 'Why does recursion overflow the stack?',
      subject: 'Computer Science',
      priority: 'HIGH',
      status: 'OPEN',
      studentId: student.id,
    });
  });

  it('rejects a missing question with 400', async () => {
    const student = await createUser('STUDENT', 'student@test.dev');

    const res = await request(app)
      .post('/api/doubts')
      .set('Cookie', authCookie(student))
      .send({ subject: 'Maths' });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('rejects a missing subject with 400', async () => {
    const student = await createUser('STUDENT', 'student@test.dev');

    const res = await request(app)
      .post('/api/doubts')
      .set('Cookie', authCookie(student))
      .send({ question: 'Why?' });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });
});

describe('GET /api/doubts/mine', () => {
  it('returns only the requesting student\'s doubts (happy path)', async () => {
    const student1 = await createUser('STUDENT', 's1@test.dev');
    const student2 = await createUser('STUDENT', 's2@test.dev');
    await prisma.doubt.createMany({
      data: [
        { question: 'q1', subject: 'Maths', studentId: student1.id },
        { question: 'q2', subject: 'Physics', studentId: student1.id },
        { question: 'q3', subject: 'Chemistry', studentId: student2.id },
      ],
    });

    const res = await request(app)
      .get('/api/doubts/mine')
      .set('Cookie', authCookie(student1));

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(
      res.body.every((d: { studentId: string }) => d.studentId === student1.id)
    ).toBe(true);
  });

  it('rejects an unauthenticated request (401)', async () => {
    const res = await request(app).get('/api/doubts/mine');

    expect(res.status).toBe(401);
    expect(res.body.code).toBe('UNAUTHENTICATED');
  });
});

describe('GET /api/doubts', () => {
  it('returns all doubts for a teacher (happy path)', async () => {
    const teacher = await createUser('TEACHER', 't@test.dev');
    const student1 = await createUser('STUDENT', 's1@test.dev');
    const student2 = await createUser('STUDENT', 's2@test.dev');
    await prisma.doubt.createMany({
      data: [
        { question: 'q1', subject: 'Maths', studentId: student1.id },
        { question: 'q2', subject: 'Physics', studentId: student2.id },
      ],
    });

    const res = await request(app)
      .get('/api/doubts')
      .set('Cookie', authCookie(teacher));

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it('forbids a student from listing all doubts (403)', async () => {
    const student = await createUser('STUDENT', 's@test.dev');

    const res = await request(app)
      .get('/api/doubts')
      .set('Cookie', authCookie(student));

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('FORBIDDEN');
  });
});

describe('PATCH /api/doubts/:id/resolve', () => {
  it('resolves an existing doubt for a teacher (happy path)', async () => {
    const teacher = await createUser('TEACHER', 't@test.dev');
    const student = await createUser('STUDENT', 's@test.dev');
    const doubt = await prisma.doubt.create({
      data: { question: 'q', subject: 'Maths', studentId: student.id },
    });

    const res = await request(app)
      .patch(`/api/doubts/${doubt.id}/resolve`)
      .set('Cookie', authCookie(teacher));

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: doubt.id,
      status: 'RESOLVED',
      resolvedBy: teacher.id,
    });
  });

  it('returns 404 for a non-existent doubt id', async () => {
    const teacher = await createUser('TEACHER', 't@test.dev');

    const res = await request(app)
      .patch('/api/doubts/00000000-0000-0000-0000-000000000000/resolve')
      .set('Cookie', authCookie(teacher));

    expect(res.status).toBe(404);
    expect(res.body.code).toBe('NOT_FOUND');
  });
});

describe('GET /api/doubts — priority/status filters (v2)', () => {
  // One doubt per (priority, status) combination needed by these tests.
  const seedMixed = (studentId: string, teacherId: string) =>
    prisma.doubt.createMany({
      data: [
        { question: 'low-open', subject: 'Maths', priority: 'LOW', status: 'OPEN', studentId },
        { question: 'high-open', subject: 'Maths', priority: 'HIGH', status: 'OPEN', studentId },
        {
          question: 'medium-resolved',
          subject: 'Maths',
          priority: 'MEDIUM',
          status: 'RESOLVED',
          studentId,
          resolvedBy: teacherId,
        },
      ],
    });

  it('?priority=HIGH returns only HIGH doubts', async () => {
    const teacher = await createUser('TEACHER', 't@test.dev');
    const student = await createUser('STUDENT', 's@test.dev');
    await seedMixed(student.id, teacher.id);

    const res = await request(app)
      .get('/api/doubts?priority=HIGH')
      .set('Cookie', authCookie(teacher));

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(
      res.body.every((d: { priority: string }) => d.priority === 'HIGH')
    ).toBe(true);
  });

  it('?status=OPEN returns only OPEN doubts', async () => {
    const teacher = await createUser('TEACHER', 't@test.dev');
    const student = await createUser('STUDENT', 's@test.dev');
    await seedMixed(student.id, teacher.id);

    const res = await request(app)
      .get('/api/doubts?status=OPEN')
      .set('Cookie', authCookie(teacher));

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(
      res.body.every((d: { status: string }) => d.status === 'OPEN')
    ).toBe(true);
  });

  it('?priority=HIGH&status=OPEN combines both filters', async () => {
    const teacher = await createUser('TEACHER', 't@test.dev');
    const student = await createUser('STUDENT', 's@test.dev');
    await seedMixed(student.id, teacher.id);

    const res = await request(app)
      .get('/api/doubts?priority=HIGH&status=OPEN')
      .set('Cookie', authCookie(teacher));

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({ priority: 'HIGH', status: 'OPEN' });
  });

  it('rejects an invalid priority value with 400', async () => {
    const teacher = await createUser('TEACHER', 't@test.dev');

    const res = await request(app)
      .get('/api/doubts?priority=URGENT')
      .set('Cookie', authCookie(teacher));

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('rejects an invalid status value with 400', async () => {
    const teacher = await createUser('TEACHER', 't@test.dev');

    const res = await request(app)
      .get('/api/doubts?status=CLOSED')
      .set('Cookie', authCookie(teacher));

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });
});

describe('GET /api/doubts/mine — priority sort (v2)', () => {
  it('?sort=priority orders HIGH before MEDIUM before LOW', async () => {
    const student = await createUser('STUDENT', 's@test.dev');
    // Inserted out of priority order to prove the sort, not insertion order.
    await prisma.doubt.createMany({
      data: [
        { question: 'low', subject: 'Maths', priority: 'LOW', studentId: student.id },
        { question: 'high', subject: 'Maths', priority: 'HIGH', studentId: student.id },
        { question: 'medium', subject: 'Maths', priority: 'MEDIUM', studentId: student.id },
      ],
    });

    const res = await request(app)
      .get('/api/doubts/mine?sort=priority')
      .set('Cookie', authCookie(student));

    expect(res.status).toBe(200);
    expect(res.body.map((d: { priority: string }) => d.priority)).toEqual([
      'HIGH',
      'MEDIUM',
      'LOW',
    ]);
  });
});
