"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "./api";
import { User, UserRole } from "./types";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (input: {
    email: string;
    password: string;
    name: string;
    homeZip: string;
    role: UserRole;
  }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const loadUser = useCallback(async () => {
    const token = window.localStorage.getItem("carflip_token");
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const { user: freshUser } = await api.get<{ user: User }>("/auth/me");
      setUser(freshUser);
    } catch {
      window.localStorage.removeItem("carflip_token");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function load() {
      const token = window.localStorage.getItem("carflip_token");
      if (!token) {
        if (!ignore) {
          setUser(null);
          setIsLoading(false);
        }
        return;
      }
      try {
        const { user: freshUser } = await api.get<{ user: User }>("/auth/me");
        if (!ignore) setUser(freshUser);
      } catch {
        window.localStorage.removeItem("carflip_token");
        if (!ignore) setUser(null);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { token, user: loggedInUser } = await api.post<{ token: string; user: User }>(
      "/auth/login",
      { email, password },
      { skipAuth: true }
    );
    window.localStorage.setItem("carflip_token", token);
    setUser(loggedInUser);
  }, []);

  const signup = useCallback(
    async (input: { email: string; password: string; name: string; homeZip: string; role: UserRole }) => {
      const { token, user: newUser } = await api.post<{ token: string; user: User }>(
        "/auth/signup",
        input,
        { skipAuth: true }
      );
      window.localStorage.setItem("carflip_token", token);
      setUser(newUser);
    },
    []
  );

  const logout = useCallback(() => {
    window.localStorage.removeItem("carflip_token");
    setUser(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, refreshUser: loadUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
