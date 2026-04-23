import { validateSupabaseClientEnv } from "@/integrations/supabase/config";
import type { AppUser } from "@/lib/authz";
import type { PermissionId } from "@/lib/permissions";

const env = validateSupabaseClientEnv();
const baseUrl = env.url ? `${env.url}/functions/v1/local-auth` : "";
const apikey = env.anonKey ?? "";

type ApiResult<T> = { success: true; data: T } | { success: false; error: string };

export type LocalSession = {
  token: string;
  expiresAt: string;
};

export type MePayload = {
  user: AppUser;
  permissions: PermissionId[];
};

export type RegisterPayload = {
  email: string;
  password: string;
  nome?: string;
};

export type GenericMessagePayload = {
  success: boolean;
  message: string;
};

function buildHeaders(token?: string) {
  return {
    "Content-Type": "application/json",
    apikey,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function localAuthLogin(email: string, password: string): Promise<ApiResult<LocalSession>> {
  if (!baseUrl || !apikey) {
    return { success: false, error: "Supabase não configurado." };
  }
  const response = await fetch(`${baseUrl}/login`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify({ email, password }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { success: false, error: payload.error || "Falha ao autenticar." };
  }
  return {
    success: true,
    data: {
      token: payload.token,
      expiresAt: payload.expires_at,
    },
  };
}

export async function localAuthMe(token: string): Promise<ApiResult<MePayload>> {
  const response = await fetch(`${baseUrl}/me`, {
    method: "GET",
    headers: buildHeaders(token),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { success: false, error: payload.error || "Sessão inválida." };
  }
  return { success: true, data: payload as MePayload };
}

export async function localAuthLogout(token: string): Promise<void> {
  await fetch(`${baseUrl}/logout`, {
    method: "POST",
    headers: buildHeaders(token),
  }).catch(() => undefined);
}

export async function localAuthRegister(payload: RegisterPayload): Promise<ApiResult<GenericMessagePayload>> {
  if (!baseUrl || !apikey) {
    return { success: false, error: "Supabase não configurado." };
  }
  const response = await fetch(`${baseUrl}/register`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { success: false, error: data.error || "Falha ao cadastrar usuário." };
  }
  return { success: true, data: data as GenericMessagePayload };
}

export async function localAuthForgotPassword(): Promise<ApiResult<GenericMessagePayload>> {
  if (!baseUrl || !apikey) {
    return { success: false, error: "Supabase não configurado." };
  }
  const response = await fetch(`${baseUrl}/forgot-password`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify({}),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { success: false, error: data.error || "Falha ao processar solicitação." };
  }
  return { success: true, data: data as GenericMessagePayload };
}
