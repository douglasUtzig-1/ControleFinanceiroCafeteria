import { useMemo } from "react";
import { toast } from "sonner";
import { Shield } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import type { PermissionId, RoleId } from "@/lib/permissions";
import { PERMISSION_IDS, ROLE_IDS } from "@/lib/permissions";
import type { RolePermissionRow } from "@/lib/settingsAccess";
import { setRolePermission } from "@/lib/settingsAccess";

const ROLE_LABELS: Record<RoleId, string> = {
  proprietario: "Proprietário",
  administrativo: "Administrativo",
  visualizador: "Visualizador",
  sem_perfil: "Sem perfil",
};

const PERMISSION_LABELS: Record<PermissionId, string> = {
  "dashboard.view": "Pode visualizar dashboard",
  "dashboard.edit": "Pode editar dashboard",
  "billing.view": "Pode visualizar faturamento",
  "billing.edit": "Pode editar faturamento",
  "reports.view": "Pode visualizar relatórios",
  "settings.view": "Pode visualizar configurações",
  "profiles.manage": "Pode gerenciar perfis",
  "users.manage": "Pode gerenciar usuários",
};

type ProfilesTabProps = {
  rows: RolePermissionRow[];
  canManageProfiles: boolean;
  onChanged: () => Promise<void>;
};

const ProfilesTab = ({ rows, canManageProfiles, onChanged }: ProfilesTabProps) => {
  const byRole = useMemo(() => {
    const map = new Map<RoleId, Set<PermissionId>>();
    ROLE_IDS.forEach((role) => map.set(role, new Set()));
    rows.forEach((row) => {
      map.get(row.roleId)?.add(row.permissionId);
    });
    return map;
  }, [rows]);

  const handleToggle = async (roleId: RoleId, permissionId: PermissionId, enabled: boolean) => {
    const result = await setRolePermission(roleId, permissionId, enabled);
    if (!result.success) {
      toast.error(result.error || "Não foi possível atualizar a permissão.");
      return;
    }
    toast.success("Permissão atualizada com sucesso.");
    await onChanged();
  };

  return (
    <div className="space-y-4">
      {ROLE_IDS.map((roleId) => {
        const granted = byRole.get(roleId) ?? new Set<PermissionId>();
        const isOwner = roleId === "proprietario";
        return (
          <div key={roleId} className="rounded-lg border border-border bg-card p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">{ROLE_LABELS[roleId]}</h3>
              </div>
              {isOwner && <Badge variant="secondary">Acesso irrestrito</Badge>}
            </div>
            <div className="space-y-3">
              {PERMISSION_IDS.map((permissionId) => (
                <div key={`${roleId}-${permissionId}`} className="flex items-center justify-between gap-4">
                  <span className="text-sm text-foreground">{PERMISSION_LABELS[permissionId]}</span>
                  <Switch
                    checked={isOwner ? true : granted.has(permissionId)}
                    disabled={isOwner || !canManageProfiles}
                    onCheckedChange={(checked) => handleToggle(roleId, permissionId, checked)}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProfilesTab;
