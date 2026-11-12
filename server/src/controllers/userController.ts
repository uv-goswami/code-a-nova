import { asyncHandler } from '../utils/asyncHandler';
import type { AuthedRequest } from '../middleware/auth';
import type { UpdateProfileRequest } from '../types/api';

export const getMe = asyncHandler<AuthedRequest>(async (req, res) => {
  res.json({ success: true, data: { user: req.user } });
});

export const updateMe = asyncHandler<AuthedRequest>(async (req, res) => {
  const { fullName } = req.body as UpdateProfileRequest;
  if (fullName) req.user.fullName = fullName.trim();
  await req.user.save();
  res.json({ success: true, data: { user: req.user } });
});
