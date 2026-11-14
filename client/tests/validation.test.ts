import { describe, expect, it } from 'vitest';
import { contactSchema, loginSchema, memberBoxCount, otpSchema, registrationSchema, signupSchema } from '../src/lib/validation';

const validSignup = { fullName: 'Aanya Sharma', email: 'a@example.com', password: 'Passw0rdOK', confirmPassword: 'Passw0rdOK' };
const validReg = {
  fullName: 'Aanya Sharma', email: 'a@example.com', mobile: '9876543210', college: 'DTU', course: 'B.Tech', branch: 'CSE',
  yearOfStudy: '3rd Year', domain: 'AI/ML', projectName: 'Smart Attendance', pptLink: 'https://drive.google.com/x',
  prototypeLink: 'https://github.com/a/b', demoVideoLink: '', teamSize: 2, teamMembers: [{ name: 'Riya Verma', email: 'r@example.com' }],
};

describe('signupSchema', () => {
  it('accepts valid input', () => expect(signupSchema.safeParse(validSignup).success).toBe(true));
  it.each([
    ['digits in name', { fullName: 'Aanya 1' }],
    ['short name', { fullName: 'Al' }],
    ['bad email', { email: 'nope' }],
    ['no digit in password', { password: 'onlyletters', confirmPassword: 'onlyletters' }],
    ['short password', { password: 'a1', confirmPassword: 'a1' }],
    ['mismatch', { confirmPassword: 'Different1' }],
  ])('rejects %s', (_l, patch) => expect(signupSchema.safeParse({ ...validSignup, ...patch }).success).toBe(false));
});

describe('registrationSchema', () => {
  it('accepts valid input, with optional demo video empty', () => expect(registrationSchema.safeParse(validReg).success).toBe(true));
  it.each([
    ['mobile starting with 5', { mobile: '5876543210' }],
    ['9-digit mobile', { mobile: '987654321' }],
    ['short project name', { projectName: 'abcd' }],
    ['non-http link', { pptLink: 'ftp://x.com/a' }],
    ['unselected college', { college: '' }],
    ['team size 6', { teamSize: 6 }],
    ['NaN team size', { teamSize: NaN }],
    ['duplicate member email', { teamMembers: [{ name: 'Riya Verma', email: 'A@example.com' }] }],
    ['member name with digits', { teamMembers: [{ name: 'Riya 2', email: 'r@example.com' }] }],
  ])('rejects %s', (_l, patch) => expect(registrationSchema.safeParse({ ...validReg, ...patch }).success).toBe(false));

  it('accepts a valid demo video link', () =>
    expect(registrationSchema.safeParse({ ...validReg, demoVideoLink: 'https://youtu.be/abc' }).success).toBe(true));
});

describe('other schemas', () => {
  it('login', () => { expect(loginSchema.safeParse({ email: 'a@example.com', password: 'x' }).success).toBe(true); expect(loginSchema.safeParse({ email: 'a@example.com', password: '' }).success).toBe(false); });
  it('otp is exactly 6 digits', () => { expect(otpSchema.safeParse('123456').success).toBe(true); ['12345', '1234567', 'abcdef'].forEach((v) => expect(otpSchema.safeParse(v).success).toBe(false)); });
  it('contact needs a 10+ char message', () => { expect(contactSchema.safeParse({ name: 'Dev', email: 'd@example.com', message: 'short' }).success).toBe(false); });
});

describe('memberBoxCount (ADR-0006)', () => {
  it('team size includes the registrant', () => {
    expect([1, 2, 3, 5].map(memberBoxCount)).toEqual([0, 1, 2, 4]);
  });
});
