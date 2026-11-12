import request from 'supertest';
import * as emailService from '../../src/services/emailService';
import { app } from '../../src/app';
import * as db from '../helpers/db';
import { Registration } from '../../src/models/Registration';
import { createVerifiedUser, validRegistration } from '../helpers/factory';

jest.mock('../../src/services/emailService');
const email = jest.mocked(emailService);


beforeAll(db.connect);
afterAll(db.close);
beforeEach(async () => { await db.clear(); jest.clearAllMocks(); });

const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

describe('POST /api/hackathon/register', () => {
  test('401 without a token', async () => {
    const res = await request(app).post('/api/hackathon/register').send(validRegistration());
    expect(res.status).toBe(401);
  });

  test('201 saves the entry and sends a confirmation email', async () => {
    const { token, user } = await createVerifiedUser(app, email);
    const res = await request(app).post('/api/hackathon/register').set(auth(token)).send(validRegistration());
    expect(res.status).toBe(201);
    expect(res.body.data.emailSent).toBe(true);
    expect(res.body.data.registration).toMatchObject({ projectName: 'Smart Attendance', user: user.id, teamSize: 3 });
    expect(res.body.data.registration.teamMembers).toHaveLength(2);
    expect(email.sendRegistrationConfirmation).toHaveBeenCalledWith('aanya@example.com', expect.objectContaining({ domain: 'AI/ML' }));
  });

  test('solo registration (teamSize 1) needs no members and demo video is optional', async () => {
    const { token } = await createVerifiedUser(app, email);
    const body = validRegistration({ teamSize: 1, teamMembers: [], demoVideoLink: undefined });
    delete body.demoVideoLink;
    const res = await request(app).post('/api/hackathon/register').set(auth(token)).send(body);
    expect(res.status).toBe(201);
    expect(res.body.data.registration.demoVideoLink).toBeNull();
  });

  test('registration survives an email failure and reports emailSent=false', async () => {
    const { token } = await createVerifiedUser(app, email);
    email.sendRegistrationConfirmation.mockRejectedValueOnce(new Error('smtp down'));
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const res = await request(app).post('/api/hackathon/register').set(auth(token)).send(validRegistration());
    errSpy.mockRestore();
    expect(res.status).toBe(201);
    expect(res.body.data.emailSent).toBe(false);
    expect(await Registration.countDocuments()).toBe(1);
  });

  test('409 ALREADY_REGISTERED on a second submission', async () => {
    const { token } = await createVerifiedUser(app, email);
    await request(app).post('/api/hackathon/register').set(auth(token)).send(validRegistration()).expect(201);
    const res = await request(app).post('/api/hackathon/register').set(auth(token)).send(validRegistration());
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('ALREADY_REGISTERED');
  });

  test.each([
    ['bad mobile', { mobile: '1234567890' }],
    ['short mobile', { mobile: '98765' }],
    ['unknown college', { college: 'Hogwarts' }],
    ['unknown domain', { domain: 'Quantum Sorcery' }],
    ['short project name', { projectName: 'abcd' }],
    ['non-url ppt link', { pptLink: 'hello' }],
    ['teamSize 6', { teamSize: 6 }],
    ['teamSize 0', { teamSize: 0 }],
    ['extra field', { isAdmin: true }],
  ])('400 on %s', async (_l, overrides) => {
    const { token } = await createVerifiedUser(app, email);
    const res = await request(app).post('/api/hackathon/register').set(auth(token)).send(validRegistration(overrides));
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test.each([
    ['members count != teamSize-1', { teamSize: 4 }, 'teamMembers'],
    ['email differs from account', { email: 'other@example.com' }, 'email'],
    ['PPT link on a disallowed host', { pptLink: 'https://evil.com/deck.pptx' }, 'pptLink'],
    ['video link on a disallowed host', { demoVideoLink: 'https://vimeo.com/1' }, 'demoVideoLink'],
    ['duplicate member emails', { teamMembers: [{ name: 'Riya Verma', email: 'riya@example.com' }, { name: 'Riya Two', email: 'RIYA@example.com' }] }, 'teamMembers'],
    ['member uses leader email', { teamMembers: [{ name: 'Riya Verma', email: 'aanya@example.com' }, { name: 'Kabir Singh', email: 'kabir@example.com' }] }, 'teamMembers'],
  ])('400 business rule: %s', async (_l, overrides, field) => {
    const { token } = await createVerifiedUser(app, email);
    const res = await request(app).post('/api/hackathon/register').set(auth(token)).send(validRegistration(overrides));
    expect(res.status).toBe(400);
    expect(res.body.error.details.map((d: { field: string }) => d.field)).toContain(field);
  });

  test('nothing is saved when validation fails', async () => {
    const { token } = await createVerifiedUser(app, email);
    await request(app).post('/api/hackathon/register').set(auth(token)).send(validRegistration({ mobile: '1' }));
    expect(await Registration.countDocuments()).toBe(0);
    expect(email.sendRegistrationConfirmation).not.toHaveBeenCalled();
  });
});

describe('GET /api/hackathon/my-entry', () => {
  test('404 REGISTRATION_NOT_FOUND when the user has not registered', async () => {
    const { token } = await createVerifiedUser(app, email);
    const res = await request(app).get('/api/hackathon/my-entry').set(auth(token));
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('REGISTRATION_NOT_FOUND');
  });

  test('returns only the caller\'s own registration', async () => {
    const a = await createVerifiedUser(app, email);
    const b = await createVerifiedUser(app, email, { fullName: 'Bhavya Rao', email: 'bhavya@example.com' });
    await request(app).post('/api/hackathon/register').set(auth(a.token)).send(validRegistration()).expect(201);
    await request(app).post('/api/hackathon/register').set(auth(b.token))
      .send(validRegistration({ fullName: 'Bhavya Rao', email: 'bhavya@example.com', projectName: 'Bhavya Project', teamMembers: [{ name: 'Riya Verma', email: 'riya2@example.com' }, { name: 'Kabir Singh', email: 'kabir2@example.com' }] }))
      .expect(201);

    const res = await request(app).get('/api/hackathon/my-entry').set(auth(b.token));
    expect(res.status).toBe(200);
    expect(res.body.data.registration.projectName).toBe('Bhavya Project');
  });
});

describe('DELETE /api/hackathon/:id', () => {
  async function seed() {
    const owner = await createVerifiedUser(app, email);
    const reg = await request(app).post('/api/hackathon/register').set(auth(owner.token)).send(validRegistration());
    return { owner, id: reg.body.data.registration.id };
  }

  test('owner can delete own registration', async () => {
    const { owner, id } = await seed();
    await request(app).delete(`/api/hackathon/${id}`).set(auth(owner.token)).expect(200);
    expect(await Registration.countDocuments()).toBe(0);
  });

  test('another participant gets 403', async () => {
    const { id } = await seed();
    const other = await createVerifiedUser(app, email, { email: 'other@example.com', fullName: 'Other Person' });
    const res = await request(app).delete(`/api/hackathon/${id}`).set(auth(other.token));
    expect(res.status).toBe(403);
    expect(await Registration.countDocuments()).toBe(1);
  });

  test('admin can delete anyone\'s registration', async () => {
    const { id } = await seed();
    const admin = await createVerifiedUser(app, email, { email: 'admin@example.com', fullName: 'Admin User' });
    await request(app).delete(`/api/hackathon/${id}`).set(auth(admin.token)).expect(200);
  });

  test('404 for unknown id, 400 for malformed id', async () => {
    const { owner } = await seed();
    await request(app).delete('/api/hackathon/665f1c2e8b3a4c0012a4d111').set(auth(owner.token)).expect(404);
    await request(app).delete('/api/hackathon/not-an-id').set(auth(owner.token)).expect(400);
  });
});
