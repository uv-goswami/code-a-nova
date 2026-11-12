// Test data builders. `email` is the jest-mocked emailService (only the OTP mock is needed here).
import request from 'supertest';
import type { Express } from 'express';
import type { RegistrationRequest, SignupRequest } from '../../src/types/api';

// Structural type: satisfied by `jest.mocked(emailService)`.
export interface OtpMailMock {
  sendOtpEmail: { mock: { calls: Array<[to: string, otp: string]> } };
}

export const validSignup = (overrides: Record<string, unknown> = {}): SignupRequest => ({
  fullName: 'Aanya Sharma',
  email: 'aanya@example.com',
  password: 'Passw0rdOK',
  confirmPassword: 'Passw0rdOK',
  ...overrides,
});

export const lastOtp = (email: OtpMailMock): string => {
  const call = email.sendOtpEmail.mock.calls.at(-1);
  if (!call) throw new Error('No OTP email was sent');
  return call[1];
};

// signup -> read OTP from mocked mailer -> verify -> login.
export async function createVerifiedUser(
  app: Express,
  email: OtpMailMock,
  overrides: Record<string, unknown> = {}
) {
  const payload = validSignup(overrides);
  await request(app).post('/api/auth/signup').send(payload).expect(201);
  await request(app).post('/api/auth/verify-otp').send({ email: payload.email, otp: lastOtp(email) }).expect(200);
  const res = await request(app).post('/api/auth/login').send({ email: payload.email, password: payload.password }).expect(200);
  return { token: res.body.data.token as string, user: res.body.data.user, payload };
}

export const validRegistration = (overrides: Record<string, unknown> = {}): RegistrationRequest => ({
  fullName: 'Aanya Sharma',
  email: 'aanya@example.com',
  mobile: '9876543210',
  college: 'Delhi Technological University',
  course: 'B.Tech',
  branch: 'CSE',
  yearOfStudy: '3rd Year',
  domain: 'AI/ML',
  projectName: 'Smart Attendance',
  pptLink: 'https://drive.google.com/file/d/abc123/view',
  prototypeLink: 'https://github.com/team/smart-attendance',
  demoVideoLink: 'https://youtu.be/abc123',
  teamSize: 3,
  teamMembers: [
    { name: 'Riya Verma', email: 'riya@example.com' },
    { name: 'Kabir Singh', email: 'kabir@example.com' },
  ],
  ...overrides,
});
