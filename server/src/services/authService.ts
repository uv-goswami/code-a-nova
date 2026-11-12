// Signup / OTP / login business logic. No Express objects in here (testable, ADR-0002).
import bcrypt from 'bcrypt';
import { config } from '../config/env';
import { User, SENSITIVE_FIELDS, type UserDocument } from '../models/User';
import { ApiError } from '../utils/ApiError';
import { assertPasswordsMatch } from '../validators/rules';
import * as otp from './otpService';
import * as email from './emailService';
import { signToken } from './tokenService';
import type { LoginRequest, ResendOtpRequest, SignupRequest, VerifyOtpRequest } from '../types/api';

const normalizeEmail = (value: string): string => value.trim().toLowerCase();

// Generates a fresh OTP, stores only its hash, then emails it.
// Enforces the resend cooldown so the endpoint cannot be used to spam inboxes.
async function issueOtp(user: UserDocument): Promise<void> {
  const now = Date.now();
  const cooldownMs = config.otpResendCooldownSeconds * 1000;
  if (user.otpLastSentAt && now - user.otpLastSentAt.getTime() < cooldownMs) {
    const wait = Math.ceil((cooldownMs - (now - user.otpLastSentAt.getTime())) / 1000);
    throw ApiError.tooMany('OTP_COOLDOWN', `Please wait ${wait}s before requesting another OTP`);
  }

  const code = otp.generateOtp();
  user.otpHash = otp.hashOtp(user.email, code);
  user.otpExpiresAt = otp.expiryDate(now);
  user.otpAttempts = 0;
  user.otpLastSentAt = new Date(now);
  await user.save(); // previous OTP is now invalid (overwritten)

  try {
    await email.sendOtpEmail(user.email, code);
  } catch (err) {
    console.error('[email] OTP send failed:', (err as Error).message);
    throw ApiError.badGateway('EMAIL_SEND_FAILED', 'Could not send the OTP email. Please try resending.');
  }
}

export async function signup(input: SignupRequest): Promise<{ email: string; message: string }> {
  assertPasswordsMatch(input);
  const address = normalizeEmail(input.email);

  let user = await User.findOne({ email: address }).select(SENSITIVE_FIELDS);
  if (user?.isVerified) {
    throw ApiError.conflict('EMAIL_ALREADY_REGISTERED', 'An account with this email already exists');
  }

  const passwordHash = await bcrypt.hash(input.password, config.bcryptRounds);
  if (user) {
    // Unverified leftover: let the person start over with new details.
    user.fullName = input.fullName.trim();
    user.passwordHash = passwordHash;
  } else {
    user = new User({
      fullName: input.fullName.trim(),
      email: address,
      passwordHash,
      role: config.adminEmails.includes(address) ? 'admin' : 'participant',
    });
  }
  await issueOtp(user);
  return { email: address, message: 'Account created. A 6-digit OTP has been sent to your email.' };
}

export async function verifyOtp(input: VerifyOtpRequest): Promise<{ message: string }> {
  const address = normalizeEmail(input.email);
  const user = await User.findOne({ email: address }).select(SENSITIVE_FIELDS);
  if (!user) throw ApiError.badRequest('INVALID_OTP', 'Invalid or expired OTP');
  if (user.isVerified) throw ApiError.conflict('ALREADY_VERIFIED', 'This account is already verified');
  if (!user.otpHash || !user.otpExpiresAt) throw ApiError.badRequest('INVALID_OTP', 'Invalid or expired OTP');

  if (user.otpAttempts >= config.otpMaxAttempts) {
    throw ApiError.tooMany('OTP_ATTEMPTS_EXCEEDED', 'Too many wrong attempts. Please request a new OTP.');
  }
  if (user.otpExpiresAt.getTime() < Date.now()) {
    throw ApiError.badRequest('OTP_EXPIRED', 'This OTP has expired. Please request a new one.');
  }
  if (!otp.verifyOtpHash(address, input.otp, user.otpHash)) {
    user.otpAttempts += 1;
    await user.save();
    throw ApiError.badRequest('INVALID_OTP', 'Invalid or expired OTP');
  }

  // Success: activate and invalidate the OTP (single use).
  user.isVerified = true;
  user.otpHash = undefined;
  user.otpExpiresAt = undefined;
  user.otpAttempts = 0;
  await user.save();
  return { message: 'Email verified successfully. You can now log in.' };
}

// Same response whether or not the email exists, to avoid account enumeration.
export async function resendOtp(input: ResendOtpRequest): Promise<{ message: string }> {
  const user = await User.findOne({ email: normalizeEmail(input.email) }).select(SENSITIVE_FIELDS);
  if (user && !user.isVerified) await issueOtp(user);
  return { message: 'If an unverified account exists for this email, a new OTP has been sent.' };
}

// A dummy hash makes "unknown email" take as long as "wrong password" (timing-safe).
let dummyHash: string | undefined;
const getDummyHash = (): string => (dummyHash ??= bcrypt.hashSync('not-a-real-password', config.bcryptRounds));

export async function login(input: LoginRequest): Promise<{ token: string; user: UserDocument }> {
  const user = await User.findOne({ email: normalizeEmail(input.email) }).select('+passwordHash');
  const passwordOk = await bcrypt.compare(input.password, user ? user.passwordHash : getDummyHash());
  if (!user || !passwordOk) {
    throw ApiError.unauthorized('INVALID_CREDENTIALS', 'Invalid email or password');
  }
  if (!user.isVerified) {
    throw ApiError.forbidden('EMAIL_NOT_VERIFIED', 'Please verify your email before logging in');
  }
  return { token: signToken(user), user };
}
