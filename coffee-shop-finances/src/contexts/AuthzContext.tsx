import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { AppUser } from "@/lib/authz";
import type { PermissionId } from "@/lib/permissions";
import {
  localAuthForgotPassword,
  localAuthLogin,
  localAuthLogout,
  localAuthMe,
  localAuthRegister,
  type LocalSession,
} from "@/lib/localAuthApi";

const LOCAL_SESSION_KEY = "local_auth_session_v1";

type AuthzContextValue = {
  loading: boolean;
  session: LocalSession | null;
  user: AppUser | null;
  permissions: Set<PermissionId>;
  can: (permission: PermissionId) => boolean;
  refresh: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  register: (email: string, password: string, nome?: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  forgotPassword: () => Promise<{ success: boolean; error?: string; message?: string }>;
};

const AuthzContext = createContext<AuthzContextValue | undefined>(undefined);

export function AuthzProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<LocalSession | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [permissions, setPermissions] = useState<Set<PermissionId>>(new Set());

  const clearSessionState = useCallback(() => {
    localStorage.removeItem(LOCAL_SESSION_KEY);
    setSession(null);
    setUser(null);
    setPermissions(new Set());
  }, []);

  const refresh = useCallback(async () => {
    const sessionRaw = localStorage.getItem(LOCAL_SESSION_KEY);
    if (!sessionRaw) {
      clearSessionState();
      setLoading(false);
      return;
    }

    const parsed = JSON.parse(sessionRaw) as LocalSession;
    setSession(parsed);

    if (!parsed?.token) {
      clearSessionState();
      setLoading(false);
      return;
    }

    setLoading(true);
    const meResult = await localAuthMe(parsed.token);
    if (!meResult.success) {
      clearSessionState();
      setLoading(false);
      return;
    }

    setUser(meResult.data.user);
    setPermissions(new Set(meResult.data.permissions));
    setLoading(false);
  }, [clearSessionState]);

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await localAuthLogin(email, password);
    if (!result.success) {
      return { success: false, error: result.error };
    }
    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(result.data));
    setSession(result.data);
    await refresh();
    return { success: true };
  }, [refresh]);

  const signOut = useCallback(async () => {
    const sessionRaw = localStorage.getItem(LOCAL_SESSION_KEY);
    const parsed = sessionRaw ? (JSON.parse(sessionRaw) as LocalSession) : null;
    if (parsed?.token) {
      await localAuthLogout(parsed.token);
    }
    clearSessionState();
  }, [clearSessionState]);

  const register = useCallback(async (email: string, password: string, nome?: string) => {
    const result = await localAuthRegister({ email, password, nome });
    if (!result.success) {
      return { success: false, error: result.error };
    }
    return { success: true, message: result.data.message };
  }, []);

  const forgotPassword = useCallback(async () => {
    const result = await localAuthForgotPassword();
    if (!result.success) {
      return { success: false, error: result.error };
    }
    return { success: true, message: result.data.message };
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo<AuthzContextValue>(() => {
    return {
      loading,
      session,
      user,
      permissions,
      can: (permission) => permissions.has(permission),
      refresh,
      signIn,
      signOut,
      register,
      forgotPassword,
    };
  }, [forgotPassword, loading, permissions, refresh, register, session, signIn, signOut, user]);

  return <AuthzContext.Provider value={value}>{children}</AuthzContext.Provider>;
}

export function useAuthz() {
  const context = useContext(AuthzContext);
  if (!context) {
    throw new Error("useAuthz deve ser usado dentro de AuthzProvider");
  }
  return context;
}
