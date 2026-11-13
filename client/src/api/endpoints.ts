// One typed function per API endpoint (contract: server/openapi/openapi.yaml).
import { request } from './client';
import type {
  ContactRequest, FormOptions, LoginRequest, Registration, RegistrationRequest,
  SignupRequest, User, VerifyOtpRequest,
} from '../types/api';

export const api = {
  getOptions: () => request<FormOptions>('/meta/options', { auth: false }),

  signup: (body: SignupRequest) => request<{ email: string; message: string }>('/auth/signup', { method: 'POST', body, auth: false }),
  verifyOtp: (body: VerifyOtpRequest) => request<{ message: string }>('/auth/verify-otp', { method: 'POST', body, auth: false }),
  resendOtp: (email: string) => request<{ message: string }>('/auth/resend-otp', { method: 'POST', body: { email }, auth: false }),
  login: (body: LoginRequest) => request<{ token: string; user: User }>('/auth/login', { method: 'POST', body, auth: false }),

  getMe: () => request<{ user: User }>('/user/me'),
  updateMe: (fullName: string) => request<{ user: User }>('/user/update', { method: 'PUT', body: { fullName } }),

  registerForHackathon: (body: RegistrationRequest) =>
    request<{ registration: Registration; emailSent: boolean }>('/hackathon/register', { method: 'POST', body }),
  getMyEntry: () => request<{ registration: Registration }>('/hackathon/my-entry'),
  deleteRegistration: (id: string) => request<{ message: string }>(`/hackathon/${id}`, { method: 'DELETE' }),

  submitContact: (body: ContactRequest) => request<{ message: string; contactEmail: string }>('/contact', { method: 'POST', body, auth: false }),
};
