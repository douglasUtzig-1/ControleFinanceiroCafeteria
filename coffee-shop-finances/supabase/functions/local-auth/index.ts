import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

type LoginBody = {
  email?: string;
  password?: string;
};

type RegisterBody = {
  email?: string;
  password?: string;
  nome?: string;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-forwarded-for",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const encoder = new TextEncoder();

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

async function sha256(value: string): Promise<string> {
  const buffer = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function pbkdf2Hash(password: string, saltHex: string, iterations: number): Promise<string> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );
  const salt = Uint8Array.from(saltHex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) ?? []);
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt,
      iterations,
    },
    keyMaterial,
    256
  );
  return Array.from(new Uint8Array(bits))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function getTokenFromAuthHeader(request: Request): string | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return null;
  const [scheme, token] = authHeader.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;
  return token.trim();
}

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function handleLogin(request: Request) {
  const body = (await request.json()) as LoginBody;
  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";

  if (!email || !password) {
    return jsonResponse(400, { error: "E-mail e senha são obrigatórios." });
  }

  const { data: authUser, error: authError } = await admin
    .from("auth_local_users")
    .select("id,email,password_hash,password_salt,password_iterations,is_active,app_user_id,approval_status")
    .eq("email", email)
    .maybeSingle();

  if (authError) {
    return jsonResponse(500, { error: "Erro ao consultar credenciais." });
  }

  if (!authUser || !authUser.is_active) {
    return jsonResponse(401, { error: "Credenciais inválidas." });
  }

  if (authUser.approval_status === "pendente_aprovacao") {
    return jsonResponse(403, { error: "Cadastro enviado para aprovação do administrador." });
  }

  if (authUser.approval_status === "recusado") {
    return jsonResponse(403, { error: "Seu cadastro não foi liberado. Contate o administrador." });
  }

  const candidateHash = await pbkdf2Hash(
    password,
    authUser.password_salt,
    authUser.password_iterations ?? 120000
  );
  if (candidateHash !== authUser.password_hash) {
    return jsonResponse(401, { error: "Credenciais inválidas." });
  }

  const rawToken = crypto.randomUUID() + crypto.randomUUID();
  const tokenHash = await sha256(rawToken);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString();
  const userAgent = request.headers.get("user-agent");
  const ip = request.headers.get("x-forwarded-for");

  const { error: sessionError } = await admin.from("auth_local_sessions").insert({
    user_id: authUser.id,
    token_hash: tokenHash,
    expires_at: expiresAt,
    user_agent: userAgent,
    ip,
  });

  if (sessionError) {
    return jsonResponse(500, { error: "Erro ao criar sessão." });
  }

  await admin.from("auth_local_users").update({ last_login_at: new Date().toISOString() }).eq("id", authUser.id);

  return jsonResponse(200, {
    token: rawToken,
    expires_at: expiresAt,
    user: {
      email: authUser.email,
      app_user_id: authUser.app_user_id,
    },
  });
}

async function handleRegister(request: Request) {
  const body = (await request.json()) as RegisterBody;
  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";
  const nome = body.nome?.trim() || null;

  if (!email || !password) {
    return jsonResponse(400, { error: "Preencha e-mail e senha para cadastrar." });
  }

  if (password.length < 6) {
    return jsonResponse(400, { error: "A senha deve ter pelo menos 6 caracteres." });
  }

  const { data: existing, error: existingError } = await admin
    .from("auth_local_users")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existingError) {
    return jsonResponse(500, { error: "Erro ao verificar usuário existente." });
  }

  if (existing) {
    return jsonResponse(409, { error: "Usuário já cadastrado." });
  }

  const appUserId = crypto.randomUUID();
  const saltBytes = crypto.getRandomValues(new Uint8Array(16));
  const saltHex = Array.from(saltBytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  const iterations = 120000;
  const passwordHash = await pbkdf2Hash(password, saltHex, iterations);

  const { error: appUserError } = await admin.from("app_users").insert({
    id: appUserId,
    email,
    nome,
    cargo: "sem_perfil",
    ativo: true,
    approval_status: "pendente_aprovacao",
  });

  if (appUserError) {
    return jsonResponse(500, { error: "Erro ao criar usuário no sistema." });
  }

  const { error: authUserError } = await admin.from("auth_local_users").insert({
    email,
    password_hash: passwordHash,
    password_salt: saltHex,
    password_iterations: iterations,
    is_active: true,
    app_user_id: appUserId,
    approval_status: "pendente_aprovacao",
  });

  if (authUserError) {
    await admin.from("app_users").delete().eq("id", appUserId);
    return jsonResponse(500, { error: "Erro ao criar credenciais de acesso." });
  }

  return jsonResponse(201, {
    success: true,
    message: "Usuário cadastrado com sucesso. Aguarde liberação de perfil para acessar o sistema.",
  });
}

async function handleForgotPassword() {
  return jsonResponse(200, {
    success: true,
    message: "Para recuperação de senha, entre em contato com o administrador do sistema.",
  });
}

async function handleMe(request: Request) {
  const token = getTokenFromAuthHeader(request);
  if (!token) return jsonResponse(401, { error: "Token ausente." });
  const tokenHash = await sha256(token);

  const { data: sessionRow, error: sessionError } = await admin
    .from("auth_local_sessions")
    .select("id,user_id,expires_at,revoked_at,auth_local_users(app_user_id,email,is_active)")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (sessionError || !sessionRow) {
    return jsonResponse(401, { error: "Sessão inválida." });
  }

  if (sessionRow.revoked_at || new Date(sessionRow.expires_at).getTime() <= Date.now()) {
    return jsonResponse(401, { error: "Sessão expirada." });
  }

  const localUser = sessionRow.auth_local_users as { app_user_id: string; email: string; is_active: boolean } | null;
  if (!localUser?.is_active) {
    return jsonResponse(403, { error: "Usuário inativo." });
  }

  const { data: appUser, error: appUserError } = await admin
    .from("app_users")
    .select("id,email,nome,cargo,ativo,approval_status")
    .eq("id", localUser.app_user_id)
    .maybeSingle();

  if (appUserError || !appUser) {
    return jsonResponse(403, { error: "Usuário sem vínculo de aplicação." });
  }

  if (appUser.approval_status !== "ativo") {
    return jsonResponse(403, {
      error:
        appUser.approval_status === "pendente_aprovacao"
          ? "Cadastro enviado para aprovação do administrador."
          : "Seu cadastro não foi liberado. Contate o administrador.",
    });
  }

  const { data: rolePermissions } = await admin
    .from("role_permissions")
    .select("permission_id")
    .eq("role_id", appUser.cargo);

  const permissions = (rolePermissions ?? []).map((row) => row.permission_id);

  return jsonResponse(200, {
    user: appUser,
    permissions,
  });
}

async function handleLogout(request: Request) {
  const token = getTokenFromAuthHeader(request);
  if (!token) return jsonResponse(200, { success: true });
  const tokenHash = await sha256(token);
  await admin
    .from("auth_local_sessions")
    .update({ revoked_at: new Date().toISOString() })
    .eq("token_hash", tokenHash)
    .is("revoked_at", null);
  return jsonResponse(200, { success: true });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const url = new URL(request.url);
  const path = url.pathname.endsWith("/") ? url.pathname.slice(0, -1) : url.pathname;

  if (request.method === "POST" && path.endsWith("/login")) {
    return handleLogin(request);
  }

  if (request.method === "POST" && path.endsWith("/register")) {
    return handleRegister(request);
  }

  if (request.method === "POST" && path.endsWith("/forgot-password")) {
    return handleForgotPassword();
  }

  if (request.method === "POST" && path.endsWith("/logout")) {
    return handleLogout(request);
  }

  if (request.method === "GET" && path.endsWith("/me")) {
    return handleMe(request);
  }

  return jsonResponse(404, { error: "Rota não encontrada." });
});
