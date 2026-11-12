import request from 'supertest';
import jwt from 'jsonwebtoken';
import * as emailService from '../../src/services/emailService';
import { app } from '../../src/app';
import * as db from '../helpers/db';
import { createVerifiedUser } from '../helpers/factory';

jest.mock('../../src/services/emailService');
const email = jest.mocked(emailService);


beforeAll(db.connect);
afterAll(db.close);
beforeEach(async () => { await db.clear(); jest.clearAllMocks(); });

describe('JWT guard', () => {
  test.each([
    ['no header', undefined],
    ['wrong scheme', 'Basic abc'],
    ['garbage token', 'Bearer not.a.jwt'],
  ])('401 with %s', async (_l, header) => {
    const req = request(app).get('/api/user/me');
    if (header) req.set('Authorization', header);
    const res = await req;
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  test('401 TOKEN_EXPIRED for an expired token', async () => {
    const { user } = await createVerifiedUser(app, email);
    const expired = jwt.sign({ sub: user.id, role: 'participant' }, process.env.JWT_SECRET as string, { expiresIn: -10 });
    const res = await request(app).get('/api/user/me').set('Authorization', `Bearer ${expired}`);
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('TOKEN_EXPIRED');
  });

  test('token signed with another secret is rejected', async () => {
    const forged = jwt.sign({ sub: '665f1c2e8b3a4c0012a4d111' }, 'other-secret');
    const res = await request(app).get('/api/user/me').set('Authorization', `Bearer ${forged}`);
    expect(res.status).toBe(401);
  });
});

describe('GET /api/user/me', () => {
  test('returns the profile without sensitive fields', async () => {
    const { token } = await createVerifiedUser(app, email);
    const res = await request(app).get('/api/user/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.user).toMatchObject({ fullName: 'Aanya Sharma', email: 'aanya@example.com' });
    expect(JSON.stringify(res.body)).not.toMatch(/passwordHash|otpHash/);
  });
});

describe('PUT /api/user/update', () => {
  test('updates fullName', async () => {
    const { token } = await createVerifiedUser(app, email);
    const res = await request(app).put('/api/user/update').set('Authorization', `Bearer ${token}`).send({ fullName: 'Aanya Kapoor' });
    expect(res.status).toBe(200);
    expect(res.body.data.user.fullName).toBe('Aanya Kapoor');
  });

  test('rejects attempts to change email/role (mass assignment)', async () => {
    const { token } = await createVerifiedUser(app, email);
    const res = await request(app).put('/api/user/update').set('Authorization', `Bearer ${token}`).send({ role: 'admin' });
    expect(res.status).toBe(400);
  });

  test('rejects empty body', async () => {
    const { token } = await createVerifiedUser(app, email);
    const res = await request(app).put('/api/user/update').set('Authorization', `Bearer ${token}`).send({});
    expect(res.status).toBe(400);
  });
});
