"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { auth, setToken, removeToken, type User } from "./api";

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

  // Hydrate user on mount — tries httpOnly cookie first (via credentials:include
  // in fetchAPI), then falls back to localStorage token for existing sessions.
  useEffect(() => {
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
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await auth.login(email, password);
      // By default prefer cookie-based auth (httpOnly cookie set by server).
      // Only persist token to localStorage if explicitly enabled via
      // `NEXT_PUBLIC_STORE_TOKEN=true` (useful for mobile / API clients).
      if (process.env.NEXT_PUBLIC_STORE_TOKEN === 'true') {
        setToken(response.access_token || response.token || '');
      }
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
      if (process.env.NEXT_PUBLIC_STORE_TOKEN === 'true') {
        setToken(response.access_token || response.token || '');
      }
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
