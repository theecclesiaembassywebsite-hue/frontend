"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { auth, persistTokenIfEnabled, removeToken, type User } from "./api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  // Hydrate user on mount — tries httpOnly cookie first (via credentials:include
  // in fetchAPI), then falls back to localStorage token for existing sessions.
  useEffect(() => {
    // /auth/callback is mid handoff: the token only exists in the URL until
    // its own effect stores it, a moment after this one mounts. A getMe()
    // check fired here always races ahead with no token, fails, and its
    // removeToken() cleanup can land after — and wipe — the token
    // /auth/callback just set, losing the session before /dashboard ever
    // sees it. That page owns establishing auth state itself; skip here.
    if (pathname.startsWith('/auth/callback')) {
      setLoading(false);
      return;
    }

    const initAuth = async () => {
      try {
        const currentUser = await auth.getMe();
        setUser(currentUser);
      } catch {
        removeToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [pathname]);

  const login = async (email: string, password: string) => {
    try {
      const response = await auth.login(email, password);
      // Cookie-based auth is primary; the JS-readable copy is written only
      // when NEXT_PUBLIC_STORE_TOKEN is on. persistTokenIfEnabled owns that
      // decision for every sign-in path.
      persistTokenIfEnabled(response.access_token || response.token);
      setUser(response.user);
    } catch (error) {
      removeToken();
      setUser(null);
      throw error;
    }
  };

  const register = async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => {
    try {
      const response = await auth.register(data);
      persistTokenIfEnabled(response.access_token || response.token);
      setUser(response.user);
    } catch (error) {
      removeToken();
      setUser(null);
      throw error;
    }
  };

  // Calls backend to clear the httpOnly cookie, then wipes localStorage token
  const logout = async () => {
    await auth.logout();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
