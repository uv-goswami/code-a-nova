// Tiny fetch wrapper: base URL, bearer token, unwrapping of the { success, data | error } envelope.
const BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
const TOKEN_KEY = 'can_token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export interface FieldIssue { field: string; message: string }

/** Error thrown for every failed request; `code` matches the API's stable error codes. */
export class ApiRequestError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details: FieldIssue[] = [],
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

// AuthContext registers this so an expired/invalid token logs the user out everywhere.
let onUnauthorized: (() => void) | undefined;
export const setUnauthorizedHandler = (fn?: () => void) => { onUnauthorized = fn; };

interface Options { method?: 'GET' | 'POST' | 'PUT' | 'DELETE'; body?: unknown; auth?: boolean }

export async function request<T>(path: string, { method = 'GET', body, auth = true }: Options = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const token = tokenStore.get();
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  } catch {
    throw new ApiRequestError(0, 'NETWORK_ERROR', 'Cannot reach the server. Check your connection and try again.');
  }

  let payload: any = null;
  try { payload = await res.json(); } catch { /* non-JSON body */ }

  if (!res.ok || !payload?.success) {
    const err = payload?.error;
    if (res.status === 401 && auth && token) onUnauthorized?.();
    throw new ApiRequestError(res.status, err?.code ?? 'UNKNOWN_ERROR', err?.message ?? 'Something went wrong. Please try again.', err?.details ?? []);
  }
  return payload.data as T;
}
