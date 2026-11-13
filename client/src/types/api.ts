// Friendly names for types GENERATED from server/openapi/openapi.yaml (run `npm run gen:types`).
import type { components } from './openapi';

type S = components['schemas'];
export type User = S['User'];
export type Registration = S['Registration'];
export type TeamMember = S['TeamMember'];
export type SignupRequest = S['SignupRequest'];
export type LoginRequest = S['LoginRequest'];
export type VerifyOtpRequest = S['VerifyOtpRequest'];
export type RegistrationRequest = S['RegistrationRequest'];
export type ContactRequest = S['ContactRequest'];

export interface FormOptions {
  colleges: string[];
  courses: string[];
  branches: string[];
  yearsOfStudy: string[];
  domains: string[];
  teamSize: { min: number; max: number };
}
