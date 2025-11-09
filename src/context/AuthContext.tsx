'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type UserRole = "customer" | "professional";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  professionalId?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => void;
};

type DemoUserRecord = AuthUser & { password: string };

const STORAGE_KEY = "engineer-finder-auth";

const DEMO_USERS: DemoUserRecord[] = [
  {
    id: "customer-001",
    name: "王小姐",
    email: "user@example.com",
    password: "demo123",
    role: "customer",
  },
  {
    id: "pro-001",
    name: "李建宏",
    email: "pro@example.com",
    password: "demo123",
    role: "professional",
    professionalId: "pro-li-jianhong",
  },
];

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: AuthUser = JSON.parse(stored);
        setUser(parsed);
      }
    } catch (error) {
      console.warn("Failed to restore auth state", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const record = DEMO_USERS.find(
      (item) => item.email.toLowerCase() === email.toLowerCase() && item.password === password
    );

    if (!record) {
      return { error: "Invalid email or password" };
    }

    const { password: _ignoredPassword, ...safeUser } = record;
    void _ignoredPassword;
    setUser(safeUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(safeUser));
    return {};
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      login,
      logout,
    }),
    [user, isLoading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

export const demoCredentials = DEMO_USERS.map(({ password, ...rest }) => ({
  ...rest,
  password,
}));

