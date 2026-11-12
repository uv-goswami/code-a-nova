import { asyncHandler } from '../utils/asyncHandler';
import * as authService from '../services/authService';
import type { LoginRequest, ResendOtpRequest, SignupRequest, VerifyOtpRequest } from '../types/api';

// Bodies were already validated against openapi.yaml, so the casts below are safe.
export const signup = asyncHandler(async (req, res) => {
  const data = await authService.signup(req.body as SignupRequest);
  res.status(201).json({ success: true, data });
});

export const verifyOtp = asyncHandler(async (req, res) => {
  const data = await authService.verifyOtp(req.body as VerifyOtpRequest);
  res.json({ success: true, data });
});

export const resendOtp = asyncHandler(async (req, res) => {
  const data = await authService.resendOtp(req.body as ResendOtpRequest);
  res.json({ success: true, data });
});

export const login = asyncHandler(async (req, res) => {
  const { token, user } = await authService.login(req.body as LoginRequest);
  res.json({ success: true, data: { token, user } });
});
