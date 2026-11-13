import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api } from '../api/endpoints';
import { setUnauthorizedHandler, tokenStore } from '../api/client';
import type { User } from '../types/api';

interface AuthValue {
  user: User | null;
  /** true until we know whether the stored token is valid (prevents a login-page flash on refresh) */
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  /** explicit user action (Navbar). Unlike an expired session it should land on Home, not Login. */
  logout: () => void;
  signedOut: boolean;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(() => Boolean(tokenStore.get()));

  const [signedOut, setSignedOut] = useState(false);

  // Clears the session (used directly for expired tokens).
  const clearSession = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  const logout = useCallback(() => {
    setSignedOut(true);
    clearSession();
  }, [clearSession]);

  // Restore the session from a stored token on first load.
  useEffect(() => {
    if (!tokenStore.get()) return;
    api.getMe()
      .then(({ user: me }) => setUser(me))
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false));
  }, []);

  // Any 401 on a protected call (e.g. expired token) logs the user out.
  useEffect(() => {
    setUnauthorizedHandler(clearSession);
    return () => setUnauthorizedHandler(undefined);
  }, [clearSession]);

  const login = useCallback(async (email: string, password: string) => {
    const { token, user: me } = await api.login({ email, password });
    tokenStore.set(token);
    setSignedOut(false);
    setUser(me);
  }, []);

  const value = useMemo(() => ({ user, loading, login, logout, signedOut, setUser }), [user, loading, login, logout, signedOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
