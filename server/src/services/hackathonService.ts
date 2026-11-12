// Hackathon registration business logic (ADR-0006 team semantics).
// Field-level validation is done by OpenAPI; cross-field rules by Zod (validators/rules.ts).
import { Registration, type RegistrationDocument } from '../models/Registration';
import type { UserDocument } from '../models/User';
import { ApiError } from '../utils/ApiError';
import { assertRegistrationRules } from '../validators/rules';
import * as email from './emailService';
import type { RegistrationRequest } from '../types/api';

export async function register(
  user: UserDocument,
  input: RegistrationRequest
): Promise<{ registration: RegistrationDocument; emailSent: boolean }> {
  assertRegistrationRules(user.email, input);

  if (await Registration.exists({ user: user._id })) {
    throw ApiError.conflict('ALREADY_REGISTERED', 'You have already registered for the hackathon');
  }

  const registration = await Registration.create({
    ...input,
    user: user._id,
    email: user.email,
    demoVideoLink: input.demoVideoLink || null,
    teamMembers: input.teamMembers ?? [],
  });

  // Mail failure must not undo a valid registration (ADR-0009).
  let emailSent = true;
  try {
    await email.sendRegistrationConfirmation(user.email, registration);
  } catch (err) {
    emailSent = false;
    console.error('[email] confirmation failed:', (err as Error).message);
  }
  return { registration, emailSent };
}

export async function getMyEntry(user: UserDocument): Promise<RegistrationDocument> {
  const registration = await Registration.findOne({ user: user._id });
  if (!registration) throw ApiError.notFound('REGISTRATION_NOT_FOUND', 'You have not registered yet');
  return registration;
}

// Owner or admin may delete.
export async function remove(user: UserDocument, id: string): Promise<void> {
  const registration = await Registration.findById(id);
  if (!registration) throw ApiError.notFound('REGISTRATION_NOT_FOUND', 'Registration not found');
  const isOwner = registration.user.toString() === user.id;
  if (!isOwner && user.role !== 'admin') {
    throw ApiError.forbidden('FORBIDDEN', 'You are not allowed to delete this registration');
  }
  await registration.deleteOne();
}
