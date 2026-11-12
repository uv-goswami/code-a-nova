import * as otp from '../../src/services/otpService';

describe('otpService', () => {
  test('generateOtp returns a 6-digit numeric string', () => {
    for (let i = 0; i < 200; i += 1) expect(otp.generateOtp()).toMatch(/^\d{6}$/);
  });

  test('hash verifies for the right email+code and fails otherwise', () => {
    const hash = otp.hashOtp('a@example.com', '123456');
    expect(otp.verifyOtpHash('a@example.com', '123456', hash)).toBe(true);
    expect(otp.verifyOtpHash('a@example.com', '654321', hash)).toBe(false);
    expect(otp.verifyOtpHash('b@example.com', '123456', hash)).toBe(false);
    expect(otp.verifyOtpHash('a@example.com', '123456', undefined)).toBe(false);
  });

  test('hash is not the plain OTP', () => {
    expect(otp.hashOtp('a@example.com', '123456')).not.toContain('123456');
  });

  test('expiryDate is 10 minutes ahead', () => {
    const now = 1_000_000;
    expect(otp.expiryDate(now).getTime() - now).toBe(10 * 60 * 1000);
  });
});
