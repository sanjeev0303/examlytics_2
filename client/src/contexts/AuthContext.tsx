"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  role: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  accessToken: string | null;
  isLoading: boolean;
  isSignedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    firstName?: string,
    lastName?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  getToken: () => Promise<string | null>;
  refreshAccessToken: () => Promise<string | null>;
  updateUser: (partial: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Schedule token refresh 1 minute before 15-min expiry */
  const scheduleRefresh = useCallback((delayMs: number = 14 * 60 * 1000) => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    refreshTimerRef.current = setTimeout(async () => {
      await refreshAccessToken();
    }, delayMs);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include", // send HttpOnly refreshToken cookie
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        setUser(null);
        setAccessToken(null);
        clearAccessTokenCookie();
        return null;
      }
      const data = await res.json();
      const token: string = data.access_token;
      setAccessToken(token);
      setAccessTokenCookie(token);

      // Decode user from token payload
      const payload = parseJwt(token);
      if (payload) {
        setUser({
          id: payload.uid,
          email: payload.email,
          firstName: payload.first_name,
          lastName: payload.last_name,
          imageUrl: payload.image_url,
          role: payload.role,
        });
      }

      // Schedule next refresh (expiresIn - 60 seconds)
      const expiresIn = (data.expires_in ?? 900) * 1000 - 60 * 1000;
      scheduleRefresh(expiresIn);
      return token;
    } catch {
      setUser(null);
      setAccessToken(null);
      clearAccessTokenCookie();
      return null;
    }
  }, [scheduleRefresh]);

  // On mount, silently try to restore session using the HttpOnly refresh cookie.
  // Only attempt if an accessToken cookie exists (avoids a 401 noise when not logged in).
  useEffect(() => {
    const hasSessionCookie =
      typeof document !== "undefined" && document.cookie.includes("accessToken=");
    if (hasSessionCookie) {
      refreshAccessToken().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || "Login failed");
    }
    const data = await res.json();
    const token: string = data.access_token;
    setAccessToken(token);
    setAccessTokenCookie(token);

    const payload = parseJwt(token);
    if (payload) {
      setUser({
        id: payload.uid,
        email: payload.email,
        firstName: payload.first_name,
        lastName: payload.last_name,
        imageUrl: payload.image_url,
        role: payload.role,
      });
    }

    const expiresIn = (data.expires_in ?? 900) * 1000 - 60 * 1000;
    scheduleRefresh(expiresIn);
  };

  const register = async (
    email: string,
    password: string,
    firstName?: string,
    lastName?: string
  ) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, firstName: firstName, lastName: lastName }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || "Registration failed");
    }
    const data = await res.json();
    const token: string = data.access_token;
    setAccessToken(token);
    setAccessTokenCookie(token);

    const payload = parseJwt(token);
    if (payload) {
      setUser({
        id: payload.uid,
        email: payload.email,
        firstName: payload.first_name,
        lastName: payload.last_name,
        imageUrl: payload.image_url,
        role: payload.role,
      });
    }

    const expiresIn = (data.expires_in ?? 900) * 1000 - 60 * 1000;
    scheduleRefresh(expiresIn);
  };

  const logout = async () => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    }).catch(() => {});
    setUser(null);
    setAccessToken(null);
    clearAccessTokenCookie();
  };

  /** Drop-in replacement for Clerk's getToken() — returns the current access token. */
  const getToken = useCallback(async (): Promise<string | null> => {
    if (accessToken) return accessToken;
    // Try refresh if we lost the token but might have a cookie
    return refreshAccessToken();
  }, [accessToken, refreshAccessToken]);

  /** Merge partial user updates into local state (e.g. after profile edit) */
  const updateUser = useCallback((partial: Partial<AuthUser>) => {
    setUser((prev) => (prev ? { ...prev, ...partial } : prev));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isLoading,
        isSignedIn: !!user,
        login,
        register,
        logout,
        getToken,
        refreshAccessToken,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}

/** Decode JWT payload without verifying signature (client-side) */
function parseJwt(token: string): Record<string, string> | null {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

/** Store short-lived access token in a JS-readable cookie for middleware SSR checks */
function setAccessTokenCookie(token: string) {
  if (typeof document === "undefined") return;
  // SameSite=Strict, but NOT HttpOnly so middleware (edge) and JS can both read it
  document.cookie = `accessToken=${token};path=/;SameSite=Strict;max-age=900`;
}

function clearAccessTokenCookie() {
  if (typeof document === "undefined") return;
  document.cookie = "accessToken=;path=/;SameSite=Strict;max-age=0";
}
