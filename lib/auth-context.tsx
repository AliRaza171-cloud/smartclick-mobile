import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { apiFetch, initAuth, persistAuthResponse, logout as apiLogout, extractErrorMessage } from "./api";

interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  is_email_verified: boolean;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (email: string, password: string, fullName: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function refreshUser() {
    const res = await apiFetch("/auth/me");
    if (res.ok) {
      setUser(await res.json());
    } else {
      setUser(null);
    }
  }

  useEffect(() => {
    (async () => {
      const restored = await initAuth();
      if (restored) await refreshUser();
      setLoading(false);
    })();
  }, []);

  async function login(email: string, password: string) {
    const res = await apiFetch("/auth/login", {
      method: "POST",
      skipAuth: true,
      body: JSON.stringify({ email, password }),
    });
    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      return { ok: false, error: extractErrorMessage(body, "Login failed.") };
    }
    await persistAuthResponse(body);
    setUser(body.user);
    return { ok: true };
  }

  async function register(email: string, password: string, fullName: string) {
    const res = await apiFetch("/auth/register", {
      method: "POST",
      skipAuth: true,
      body: JSON.stringify({ email, password, full_name: fullName }),
    });
    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      return { ok: false, error: extractErrorMessage(body, "Registration failed.") };
    }
    await persistAuthResponse(body);
    setUser(body.user);
    return { ok: true };
  }

  async function logout() {
    await apiLogout();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}