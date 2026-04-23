export const ROLE_IDS = ["proprietario", "administrativo", "visualizador", "sem_perfil"] as const;

export type RoleId = (typeof ROLE_IDS)[number];

export const PERMISSION_IDS = [
  "dashboard.view",
  "dashboard.edit",
  "billing.view",
  "billing.edit",
  "reports.view",
  "settings.view",
  "profiles.manage",
  "users.manage",
] as const;

export type PermissionId = (typeof PERMISSION_IDS)[number];

export type AppPage = "billing" | "dashboard" | "reports" | "settings";

export const PAGE_VIEW_PERMISSION: Record<AppPage, PermissionId> = {
  billing: "billing.view",
  dashboard: "dashboard.view",
  reports: "reports.view",
  settings: "settings.view",
};
