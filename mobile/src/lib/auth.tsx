import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { api, setAuthToken, setUnauthorizedHandler } from '@/lib/api';
import { KEYS, storage } from '@/lib/storage';
import type { Session, User } from '@/lib/types';

type AuthState = {
  /** True until the stored session has been read on launch. */
  loading: boolean;
  user: User | null;
  onboarded: boolean;
  signIn: (session: Session) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: User) => void;
  completeOnboarding: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [onboarded, setOnboarded] = useState(false);

  const signOut = useCallback(async () => {
    setAuthToken(null);
    setUser(null);
    await storage.remove(KEYS.token);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => void signOut());
    (async () => {
      const [token, seen] = await Promise.all([storage.get(KEYS.token), storage.get(KEYS.onboarded)]);
      setOnboarded(seen === '1');
      if (token) {
        setAuthToken(token);
        try {
          setUser(await api<User>('/auth/me'));
        } catch {
          // Expired token or no connection: the user logs in again.
          setAuthToken(null);
        }
      }
      setLoading(false);
    })();
    return () => setUnauthorizedHandler(null);
  }, [signOut]);

  const value = useMemo<AuthState>(
    () => ({
      loading,
      user,
      onboarded,
      async signIn(session) {
        setAuthToken(session.token);
        await storage.set(KEYS.token, session.token);
        await storage.set(KEYS.onboarded, '1');
        setOnboarded(true);
        setUser(session.user);
      },
      signOut,
      async refreshUser() {
        setUser(await api<User>('/auth/me'));
      },
      setUser,
      async completeOnboarding() {
        await storage.set(KEYS.onboarded, '1');
        setOnboarded(true);
      },
    }),
    [loading, user, onboarded, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
