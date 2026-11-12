import { asyncHandler } from '../utils/asyncHandler';
import * as contactService from '../services/contactService';
import type { ContactRequest } from '../types/api';

export const submit = asyncHandler(async (req, res) => {
  const { message, contactEmail } = await contactService.submit(req.body as ContactRequest);
  res.status(201).json({ success: true, data: { message, contactEmail } });
});
