import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { isAppUserRole, type AppUserRole } from '@shared/app-user';

const SESSION_KEY = 'deou-interview-session-v1';

export interface SessionUser {
  name: string;
  role: AppUserRole;
  loginAt: number;
}

interface SessionContextValue {
  user: SessionUser | null;
  login: (name: string, role: AppUserRole) => void;
  logout: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

const readSession = (): SessionUser | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return null;
    const record = parsed as Record<string, unknown>;
    const name = typeof record.name === 'string' ? record.name.trim() : '';
    const role = typeof record.role === 'string' ? record.role : '';
    if (!name || !isAppUserRole(role)) return null;
    return {
      name,
      role,
      loginAt:
        typeof record.loginAt === 'number' && Number.isFinite(record.loginAt)
          ? record.loginAt
          : Date.now(),
    };
  } catch {
    return null;
  }
};

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<SessionUser | null>(readSession);

  useEffect(() => {
    try {
      if (user) {
        window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      } else {
        window.localStorage.removeItem(SESSION_KEY);
      }
    } catch {
      // 存储不可用时仅在当前会话内保持登录态
    }
  }, [user]);

  const login = useCallback((name: string, role: AppUserRole) => {
    setUser({ name: name.trim(), role, loginAt: Date.now() });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({ user, login, logout }),
    [user, login, logout],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
};

export const useSession = (): SessionContextValue => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession 必须在 SessionProvider 内使用');
  }
  return context;
};
