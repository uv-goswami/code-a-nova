// OTP generation + verification helpers (ADR-0005).
// OTPs are never stored in plain text: we keep an HMAC-SHA256 bound to the email.
import crypto from 'crypto';
import { config } from '../config/env';

// Cryptographically secure 6-digit code, zero padded ("004821").
export const generateOtp = (): string => crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');

export const hashOtp = (email: string, otp: string): string =>
  crypto.createHmac('sha256', config.otpSecret).update(`${email}:${otp}`).digest('hex');

// Constant-time comparison to avoid timing side channels.
export function verifyOtpHash(email: string, otp: string, storedHash?: string): boolean {
  if (!storedHash) return false;
  const a = Buffer.from(hashOtp(email, otp), 'hex');
  const b = Buffer.from(storedHash, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export const expiryDate = (from: number = Date.now()): Date =>
  new Date(from + config.otpTtlMinutes * 60 * 1000);
