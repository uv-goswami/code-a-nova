import request from 'supertest';
import * as emailService from '../../src/services/emailService';
import { app } from '../../src/app';
import * as db from '../helpers/db';
import { ContactMessage } from '../../src/models/ContactMessage';

jest.mock('../../src/services/emailService');
const email = jest.mocked(emailService);


beforeAll(db.connect);
afterAll(db.close);
beforeEach(async () => { await db.clear(); jest.clearAllMocks(); });

describe('system endpoints', () => {
  test('GET /api/health', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ok');
  });

  test('API responses are marked no-store (private data must not be cached)', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['cache-control']).toBe('no-store');
  });

  test('GET /api/meta/options exposes the enums defined in openapi.yaml', async () => {
    const res = await request(app).get('/api/meta/options');
    expect(res.status).toBe(200);
    expect(res.body.data.courses).toContain('B.Tech');
    expect(res.body.data.domains).toContain('Cyber Security');
    expect(res.body.data.teamSize).toEqual({ min: 1, max: 5 });
  });

  test('GET /api/openapi.json serves the contract; /api/docs serves Swagger UI', async () => {
    const json = await request(app).get('/api/openapi.json');
    expect(json.body.openapi).toMatch(/^3\./);
    expect(Object.keys(json.body.paths)).toEqual(expect.arrayContaining(['/auth/signup', '/hackathon/register']));
    const docs = await request(app).get('/api/docs/');
    expect(docs.status).toBe(200);
    expect(docs.text).toContain('swagger-ui');
  });

  test('unknown route -> 404 envelope', async () => {
    const res = await request(app).get('/api/nope');
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ success: false, error: { code: 'NOT_FOUND' } });
  });
});

describe('POST /api/contact', () => {
  const body = { name: 'Dev Patel', email: 'dev@example.com', message: 'Is there a cap on team count?' };

  test('stores the message, notifies the team, is public', async () => {
    const res = await request(app).post('/api/contact').send(body);
    expect(res.status).toBe(201);
    expect(res.body.data.contactEmail).toBe('project@example.com');
    expect(await ContactMessage.countDocuments()).toBe(1);
    expect(email.sendContactNotification).toHaveBeenCalledWith(body);
  });

  test('message is still saved if the notification email fails', async () => {
    email.sendContactNotification.mockRejectedValueOnce(new Error('smtp down'));
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const res = await request(app).post('/api/contact').send(body);
    errSpy.mockRestore();
    expect(res.status).toBe(201);
    expect(await ContactMessage.countDocuments()).toBe(1);
  });

  test('400 on short message / bad email', async () => {
    await request(app).post('/api/contact').send({ ...body, message: 'hi' }).expect(400);
    await request(app).post('/api/contact').send({ ...body, email: 'x' }).expect(400);
  });
});
