import { ContactMessage } from '../models/ContactMessage';
import { config } from '../config/env';
import * as email from './emailService';
import type { ContactRequest } from '../types/api';

// Saves the message first (never lose it), then notifies the team by email.
export async function submit(input: ContactRequest): Promise<{ message: string; contactEmail: string }> {
  await ContactMessage.create(input);
  try {
    await email.sendContactNotification(input);
  } catch (err) {
    console.error('[email] contact notification failed:', (err as Error).message);
  }
  return { message: 'Thanks! We have received your message.', contactEmail: config.contactEmail };
}
