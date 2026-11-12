// Request/response types are GENERATED from openapi.yaml (npm run gen:types -> src/types/openapi.d.ts).
// This file only gives them short, readable names. Do not hand-write API shapes here (ADR-0013).
import type { components } from './openapi';

type Schemas = components['schemas'];

export type SignupRequest = Schemas['SignupRequest'];
export type VerifyOtpRequest = Schemas['VerifyOtpRequest'];
export type ResendOtpRequest = Schemas['ResendOtpRequest'];
export type LoginRequest = Schemas['LoginRequest'];
export type UpdateProfileRequest = Schemas['UpdateProfileRequest'];
export type RegistrationRequest = Schemas['RegistrationRequest'];
export type ContactRequest = Schemas['ContactRequest'];
export type TeamMemberInput = Schemas['TeamMember'];
