import request from 'supertest';
import * as emailService from '../../src/services/emailService';
import { app } from '../../src/app';
import * as db from '../helpers/db';
import { User, SENSITIVE_FIELDS } from '../../src/models/User';
import { validSignup, lastOtp, createVerifiedUser } from '../helpers/factory';

jest.mock('../../src/services/emailService');
const email = jest.mocked(emailService);


beforeAll(db.connect);
afterAll(db.close);
beforeEach(async () => { await db.clear(); jest.clearAllMocks(); });

describe('POST /api/auth/signup', () => {
  test('creates an unverified user, hashes password, emails OTP', async () => {
    const res = await request(app).post('/api/auth/signup').send(validSignup());
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ success: true, data: { email: 'aanya@example.com' } });
    expect(email.sendOtpEmail).toHaveBeenCalledWith('aanya@example.com', expect.stringMatching(/^\d{6}$/));

    const user = await User.findOne({ email: 'aanya@example.com' }).select(SENSITIVE_FIELDS);
    expect(user!.isVerified).toBe(false);
    expect(user!.passwordHash).not.toBe('Passw0rdOK');
    expect(user!.passwordHash).toMatch(/^\$2[aby]\$/);
    expect(user!.otpHash).not.toBe(lastOtp(email)); // OTP stored hashed
  });

  test('response never leaks password or otp fields', async () => {
    const res = await request(app).post('/api/auth/signup').send(validSignup());
    expect(JSON.stringify(res.body)).not.toMatch(/passwordHash|otpHash/);
  });

  test.each([
    ['short name', { fullName: 'Al' }],
    ['digits in name', { fullName: 'Aanya 123' }],
    ['bad email', { email: 'nope' }],
    ['weak password (no digit)', { password: 'onlyletters', confirmPassword: 'onlyletters' }],
    ['short password', { password: 'a1', confirmPassword: 'a1' }],
    ['extra field', { role: 'admin' }],
  ])('400 on %s', async (_label, overrides) => {
    const res = await request(app).post('/api/auth/signup').send(validSignup(overrides));
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details.length).toBeGreaterThan(0);
  });

  test('400 PASSWORD_MISMATCH', async () => {
    const res = await request(app).post('/api/auth/signup').send(validSignup({ confirmPassword: 'Different1' }));
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('PASSWORD_MISMATCH');
  });

  test('409 when a verified account already exists', async () => {
    await createVerifiedUser(app, email);
    const res = await request(app).post('/api/auth/signup').send(validSignup());
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('EMAIL_ALREADY_REGISTERED');
  });

  test('re-signup of an unverified email overwrites details and sends a new OTP', async () => {
    await request(app).post('/api/auth/signup').send(validSignup());
    const res = await request(app).post('/api/auth/signup').send(validSignup({ fullName: 'Aanya Updated' }));
    expect(res.status).toBe(201);
    expect(email.sendOtpEmail).toHaveBeenCalledTimes(2);
    expect(await User.countDocuments()).toBe(1);
    expect((await User.findOne())!.fullName).toBe('Aanya Updated');
  });

  test('502 when email provider fails, account remains recoverable', async () => {
    email.sendOtpEmail.mockRejectedValueOnce(new Error('smtp down'));
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const res = await request(app).post('/api/auth/signup').send(validSignup());
    expect(res.status).toBe(502);
    expect(res.body.error.code).toBe('EMAIL_SEND_FAILED');
    errSpy.mockRestore();
  });

  test('admin role is granted only to emails in ADMIN_EMAILS', async () => {
    const { user } = await createVerifiedUser(app, email, { email: 'admin@example.com' });
    expect(user!.role).toBe('admin');
  });

  test('400 INVALID_JSON on malformed body', async () => {
    const res = await request(app).post('/api/auth/signup').set('Content-Type', 'application/json').send('{bad');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_JSON');
  });
});

describe('POST /api/auth/verify-otp', () => {
  beforeEach(async () => { await request(app).post('/api/auth/signup').send(validSignup()); });

  test('verifies the account and clears the OTP (single use)', async () => {
    const code = lastOtp(email);
    const ok = await request(app).post('/api/auth/verify-otp').send({ email: 'aanya@example.com', otp: code });
    expect(ok.status).toBe(200);

    const user = await User.findOne().select(SENSITIVE_FIELDS);
    expect(user!.isVerified).toBe(true);
    expect(user!.otpHash).toBeUndefined();

    const again = await request(app).post('/api/auth/verify-otp').send({ email: 'aanya@example.com', otp: code });
    expect(again.status).toBe(409);
    expect(again.body.error.code).toBe('ALREADY_VERIFIED');
  });

  test('wrong OTP -> 400 INVALID_OTP and attempt counted', async () => {
    const wrong = lastOtp(email) === '000000' ? '111111' : '000000';
    const res = await request(app).post('/api/auth/verify-otp').send({ email: 'aanya@example.com', otp: wrong });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_OTP');
    expect((await User.findOne().select('+otpAttempts'))!.otpAttempts).toBe(1);
  });

  test('locks after 5 wrong attempts even if the right OTP is then used', async () => {
    const code = lastOtp(email);
    const wrong = code === '000000' ? '111111' : '000000';
    for (let i = 0; i < 5; i += 1) {
      await request(app).post('/api/auth/verify-otp').send({ email: 'aanya@example.com', otp: wrong });
    }
    const res = await request(app).post('/api/auth/verify-otp').send({ email: 'aanya@example.com', otp: code });
    expect(res.status).toBe(429);
    expect(res.body.error.code).toBe('OTP_ATTEMPTS_EXCEEDED');
  });

  test('expired OTP -> 400 OTP_EXPIRED', async () => {
    await User.updateOne({ email: 'aanya@example.com' }, { otpExpiresAt: new Date(Date.now() - 1000) });
    const res = await request(app).post('/api/auth/verify-otp').send({ email: 'aanya@example.com', otp: lastOtp(email) });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('OTP_EXPIRED');
  });

  test('unknown email gets the same generic error', async () => {
    const res = await request(app).post('/api/auth/verify-otp').send({ email: 'ghost@example.com', otp: '123456' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_OTP');
  });

  test.each(['12345', '1234567', 'abcdef'])('400 on malformed otp %s', async (bad) => {
    const res = await request(app).post('/api/auth/verify-otp').send({ email: 'aanya@example.com', otp: bad });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('POST /api/auth/resend-otp', () => {
  test('issues a new OTP and invalidates the old one', async () => {
    await request(app).post('/api/auth/signup').send(validSignup());
    const oldCode = lastOtp(email);
    await request(app).post('/api/auth/resend-otp').send({ email: 'aanya@example.com' }).expect(200);
    const newCode = lastOtp(email);
    expect(email.sendOtpEmail).toHaveBeenCalledTimes(2);

    if (oldCode !== newCode) {
      const old = await request(app).post('/api/auth/verify-otp').send({ email: 'aanya@example.com', otp: oldCode });
      expect(old.status).toBe(400);
    }
    await request(app).post('/api/auth/verify-otp').send({ email: 'aanya@example.com', otp: newCode }).expect(200);
  });

  test('does not reveal whether an email exists', async () => {
    const res = await request(app).post('/api/auth/resend-otp').send({ email: 'ghost@example.com' });
    expect(res.status).toBe(200);
    expect(email.sendOtpEmail).not.toHaveBeenCalled();
  });
});

describe('POST /api/auth/login', () => {
  test('returns JWT and user for a verified account', async () => {
    const { token, user } = await createVerifiedUser(app, email);
    expect(token.split('.')).toHaveLength(3);
    expect(user).toMatchObject({ email: 'aanya@example.com', isVerified: true, role: 'participant' });
    expect(user!.passwordHash).toBeUndefined();
  });

  test('401 on wrong password and on unknown email (same message)', async () => {
    await createVerifiedUser(app, email);
    const a = await request(app).post('/api/auth/login').send({ email: 'aanya@example.com', password: 'WrongPass1' });
    const b = await request(app).post('/api/auth/login').send({ email: 'ghost@example.com', password: 'WrongPass1' });
    expect(a.status).toBe(401);
    expect(b.status).toBe(401);
    expect(a.body.error).toEqual(b.body.error);
  });

  test('403 EMAIL_NOT_VERIFIED for unverified accounts', async () => {
    await request(app).post('/api/auth/signup').send(validSignup());
    const res = await request(app).post('/api/auth/login').send({ email: 'aanya@example.com', password: 'Passw0rdOK' });
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('EMAIL_NOT_VERIFIED');
  });

  test('email is case-insensitive', async () => {
    await createVerifiedUser(app, email);
    await request(app).post('/api/auth/login').send({ email: 'AANYA@Example.com', password: 'Passw0rdOK' }).expect(200);
  });
});

describe('validation error field names', () => {
  test('are clean (no /body/ prefix)', async () => {
    const res = await request(app).post('/api/auth/signup').send({ fullName: 'Aanya Sharma' });
    expect(res.status).toBe(400);
    const fields = res.body.error.details.map((d: { field: string }) => d.field);
    expect(fields).toEqual(expect.arrayContaining(['email', 'password']));
    expect(fields.some((f: string) => f.startsWith('/'))).toBe(false);
  });
});
