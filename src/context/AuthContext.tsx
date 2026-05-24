import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { AuthUser } from '../types';
import { getUserById, login as dbLogin } from '../lib/db';
import { DATA_CHANGED_EVENT, STORAGE_KEYS } from '../lib/constants';

const AUTH_KEY = STORAGE_KEYS.auth;

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => void;
  refresh: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = sessionStorage.getItem(AUTH_KEY);
    if (raw) setUser(JSON.parse(raw) as AuthUser);
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await dbLogin(email, password);
    if (!result) return 'Invalid email or password.';
    sessionStorage.setItem(AUTH_KEY, JSON.stringify(result));
    setUser(result);
    return null;
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(AUTH_KEY);
    setUser(null);
  }, []);

  const refresh = useCallback(() => {
    const raw = sessionStorage.getItem(AUTH_KEY);
    if (!raw) return;
    const session = JSON.parse(raw) as AuthUser;
    const dbUser = getUserById(session.id);
    if (dbUser) {
      const updated: AuthUser = {
        id: dbUser.id,
        role: dbUser.role,
        email: dbUser.email,
        full_name: dbUser.full_name,
        avatar_url: dbUser.avatar_url ?? null,
      };
      sessionStorage.setItem(AUTH_KEY, JSON.stringify(updated));
      setUser(updated);
    } else {
      setUser(session);
    }
  }, []);

  useEffect(() => {
    const syncSession = () => refresh();
    window.addEventListener(DATA_CHANGED_EVENT, syncSession);
    return () => window.removeEventListener(DATA_CHANGED_EVENT, syncSession);
  }, [refresh]);

  const value = useMemo(
    () => ({ user, loading, login, logout, refresh }),
    [user, loading, login, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
