import { getSupabase } from "@/integrations/supabase/client";
import type { PermissionId, RoleId } from "@/lib/permissions";

export type RolePermissionRow = {
  roleId: RoleId;
  roleName: string;
  permissionId: PermissionId;
};

export type ManagedUser = {
  id: string;
  email: string;
  nome: string | null;
  cargo: RoleId;
  ativo: boolean;
  approvalStatus?: "pendente_aprovacao" | "ativo" | "recusado";
  createdAt?: string | null;
};

const ALLOWED_ROLE_IDS: RoleId[] = ["proprietario", "administrativo", "visualizador", "sem_perfil"];

function normalizeRoleId(input: string | null | undefined): RoleId {
  if (!input) return "sem_perfil";
  return ALLOWED_ROLE_IDS.includes(input as RoleId) ? (input as RoleId) : "sem_perfil";
}

export async function fetchRolePermissions(): Promise<RolePermissionRow[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("role_permissions")
    .select("role_id,permission_id,roles(name)")
    .order("role_id", { ascending: true });

  if (error) {
    console.error("Erro ao carregar permissões por perfil:", error);
    return [];
  }

  return (data ?? []).map((item) => ({
    roleId: item.role_id as RoleId,
    roleName: (item.roles as { name?: string } | null)?.name ?? item.role_id,
    permissionId: item.permission_id as PermissionId,
  }));
}

export async function setRolePermission(
  roleId: RoleId,
  permissionId: PermissionId,
  enabled: boolean
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) return { success: false, error: "Supabase não configurado." };

  if (roleId === "proprietario") {
    return { success: false, error: "Perfil Proprietário possui acesso irrestrito." };
  }

  if (enabled) {
    const { error } = await supabase
      .from("role_permissions")
      .upsert({ role_id: roleId, permission_id: permissionId }, { onConflict: "role_id,permission_id" });
    if (error) return { success: false, error: error.message };
    return { success: true };
  }

  const { error } = await supabase
    .from("role_permissions")
    .delete()
    .eq("role_id", roleId)
    .eq("permission_id", permissionId);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function fetchManagedUsers(): Promise<ManagedUser[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("app_users")
    .select("id,email,nome,cargo,ativo,approval_status,created_at")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Erro ao carregar usuários:", error);
    return [];
  }

  return (data ?? []).map((user) => ({
    id: user.id,
    email: user.email,
    nome: user.nome,
    cargo: normalizeRoleId(user.cargo),
    ativo: user.ativo ?? true,
    approvalStatus: (user.approval_status as ManagedUser["approvalStatus"]) || "ativo",
    createdAt: user.created_at,
  }));
}

export async function fetchPendingUsers(): Promise<ManagedUser[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("app_users")
    .select("id,email,nome,cargo,ativo,approval_status,created_at")
    .eq("approval_status", "pendente_aprovacao")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Erro ao carregar pendentes:", error);
    return [];
  }

  return (data ?? []).map((user) => ({
    id: user.id,
    email: user.email,
    nome: user.nome,
    cargo: normalizeRoleId(user.cargo),
    ativo: user.ativo ?? true,
    approvalStatus: "pendente_aprovacao",
    createdAt: user.created_at,
  }));
}

export async function approvePendingUser(
  id: string,
  role: Exclude<RoleId, "sem_perfil">,
  approverId?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) return { success: false, error: "Supabase não configurado." };
  const { error } = await supabase
    .from("app_users")
    .update({
      cargo: role,
      approval_status: "ativo",
      approved_by: approverId ?? null,
      approved_at: new Date().toISOString(),
      rejected_by: null,
      rejected_at: null,
      rejection_reason: null,
      ativo: true,
    })
    .eq("id", id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function rejectPendingUser(
  id: string,
  approverId?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) return { success: false, error: "Supabase não configurado." };
  const { error } = await supabase
    .from("app_users")
    .update({
      approval_status: "recusado",
      rejected_by: approverId ?? null,
      rejected_at: new Date().toISOString(),
      ativo: false,
    })
    .eq("id", id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function createManagedUser(
  payload: Omit<ManagedUser, "id"> & { id?: string }
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) return { success: false, error: "Supabase não configurado." };

  const { error } = await supabase.from("app_users").insert({
    id: payload.id ?? crypto.randomUUID(),
    email: payload.email,
    nome: payload.nome ?? null,
    cargo: payload.cargo,
    ativo: payload.ativo,
    approval_status: payload.approvalStatus ?? "ativo",
  });

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function updateManagedUser(
  id: string,
  payload: Partial<Omit<ManagedUser, "id">>
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) return { success: false, error: "Supabase não configurado." };

  const { error } = await supabase.from("app_users").update(payload).eq("id", id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function deleteManagedUser(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) return { success: false, error: "Supabase não configurado." };

  const { error } = await supabase.from("app_users").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}
