import { asyncHandler } from '../utils/asyncHandler';
import * as hackathonService from '../services/hackathonService';
import type { AuthedRequest } from '../middleware/auth';
import type { RegistrationRequest } from '../types/api';

export const register = asyncHandler<AuthedRequest>(async (req, res) => {
  const { registration, emailSent } = await hackathonService.register(req.user, req.body as RegistrationRequest);
  res.status(201).json({ success: true, data: { registration, emailSent } });
});

export const getMyEntry = asyncHandler<AuthedRequest>(async (req, res) => {
  const registration = await hackathonService.getMyEntry(req.user);
  res.json({ success: true, data: { registration } });
});

export const remove = asyncHandler<AuthedRequest>(async (req, res) => {
  await hackathonService.remove(req.user, String(req.params.id));
  res.json({ success: true, data: { message: 'Registration deleted' } });
});
