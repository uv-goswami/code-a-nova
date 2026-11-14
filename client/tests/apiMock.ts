// Pure mock object (no src imports) so vi.mock factories can import it without circular loads.
import { vi } from 'vitest';

export const apiMock = {
  getOptions: vi.fn(), signup: vi.fn(), verifyOtp: vi.fn(), resendOtp: vi.fn(), login: vi.fn(), getMe: vi.fn(), updateMe: vi.fn(),
  registerForHackathon: vi.fn(), getMyEntry: vi.fn(), deleteRegistration: vi.fn(), submitContact: vi.fn(),
};
