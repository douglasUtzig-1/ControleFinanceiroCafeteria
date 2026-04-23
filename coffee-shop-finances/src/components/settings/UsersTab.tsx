import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Check, Trash2, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { RoleId } from "@/lib/permissions";
import type { ManagedUser } from "@/lib/settingsAccess";
import { approvePendingUser, createManagedUser, deleteManagedUser, rejectPendingUser, updateManagedUser } from "@/lib/settingsAccess";
import { useAuthz } from "@/contexts/AuthzContext";

const ROLE_LABELS: Record<RoleId, string> = {
  proprietario: "Proprietário",
  administrativo: "Administrativo",
  visualizador: "Visualizador",
  sem_perfil: "Sem perfil",
};

type UsersTabProps = {
  users: ManagedUser[];
  canManageUsers: boolean;
  onChanged: () => Promise<void>;
};

const UsersTab = ({ users, canManageUsers, onChanged }: UsersTabProps) => {
  const { user: currentUser } = useAuthz();
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<RoleId>("visualizador");
  const [pendingRoleSelection, setPendingRoleSelection] = useState<Record<string, Exclude<RoleId, "sem_perfil">>>({});

  const sortedUsers = useMemo(
    () => [...users].sort((a, b) => a.email.localeCompare(b.email, "pt-BR")),
    [users]
  );
  const pendingUsers = useMemo(
    () => sortedUsers.filter((user) => user.approvalStatus === "pendente_aprovacao"),
    [sortedUsers]
  );
  const activeOrRejectedUsers = useMemo(
    () => sortedUsers.filter((user) => user.approvalStatus !== "pendente_aprovacao"),
    [sortedUsers]
  );

  const handleCreate = async () => {
    if (!newEmail.trim()) {
      toast.error("Informe o e-mail do usuário.");
      return;
    }

    const result = await createManagedUser({
      email: newEmail.trim().toLowerCase(),
      nome: newName.trim() || null,
      cargo: newRole,
      ativo: true,
      approvalStatus: "ativo",
    });

    if (!result.success) {
      toast.error(result.error || "Não foi possível criar o usuário.");
      return;
    }

    toast.success("Usuário criado com sucesso.");
    setNewName("");
    setNewEmail("");
    setNewRole("visualizador");
    await onChanged();
  };

  const handleRoleChange = async (userId: string, roleId: RoleId) => {
    const result = await updateManagedUser(userId, { cargo: roleId });
    if (!result.success) {
      toast.error(result.error || "Não foi possível alterar o perfil.");
      return;
    }
    await onChanged();
  };

  const handleActiveChange = async (userId: string, active: boolean) => {
    const result = await updateManagedUser(userId, { ativo: active });
    if (!result.success) {
      toast.error(result.error || "Não foi possível alterar o status.");
      return;
    }
    await onChanged();
  };

  const handleDelete = async (userId: string, email: string) => {
    const confirmed = window.confirm(`Deseja remover o usuário ${email}?`);
    if (!confirmed) return;
    const result = await deleteManagedUser(userId);
    if (!result.success) {
      toast.error(result.error || "Não foi possível remover o usuário.");
      return;
    }
    await onChanged();
  };

  const handleApprovePending = async (pendingUser: ManagedUser) => {
    const role = pendingRoleSelection[pendingUser.id] ?? "visualizador";
    const result = await approvePendingUser(pendingUser.id, role, currentUser?.id);
    if (!result.success) {
      toast.error(result.error || "Não foi possível aprovar o usuário.");
      return;
    }
    toast.success(`Usuário ${pendingUser.email} aprovado com perfil ${ROLE_LABELS[role]}.`);
    await onChanged();
  };

  const handleRejectPending = async (pendingUser: ManagedUser) => {
    const confirmed = window.confirm(`Deseja recusar o usuário pendente ${pendingUser.email}?`);
    if (!confirmed) return;
    const result = await rejectPendingUser(pendingUser.id, currentUser?.id);
    if (!result.success) {
      toast.error(result.error || "Não foi possível recusar o usuário.");
      return;
    }
    toast.success(`Usuário ${pendingUser.email} marcado como recusado.`);
    await onChanged();
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-card p-4 space-y-3">
        <h3 className="font-medium">Usuários aguardando liberação</h3>
        {pendingUsers.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum usuário pendente de aprovação.</p>
        ) : (
          <div className="space-y-2">
            {pendingUsers.map((pendingUser) => {
              const selectedRole = pendingRoleSelection[pendingUser.id] ?? "visualizador";
              return (
                <div key={pendingUser.id} className="rounded-md border border-border p-3 flex flex-col md:flex-row md:items-center gap-3 md:justify-between">
                  <div className="space-y-1">
                    <div className="text-sm font-medium">{pendingUser.email}</div>
                    <div className="text-xs text-muted-foreground">
                      {pendingUser.nome || "Sem nome"} · cadastro em {pendingUser.createdAt ? new Date(pendingUser.createdAt).toLocaleString("pt-BR") : "-"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={selectedRole}
                      onValueChange={(value) =>
                        setPendingRoleSelection((prev) => ({ ...prev, [pendingUser.id]: value as Exclude<RoleId, "sem_perfil"> }))
                      }
                      disabled={!canManageUsers}
                    >
                      <SelectTrigger className="w-[170px]">
                        <SelectValue placeholder="Perfil" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="administrativo">Administrativo</SelectItem>
                        <SelectItem value="visualizador">Visualizador</SelectItem>
                        <SelectItem value="proprietario">Proprietário</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="default"
                      onClick={() => handleApprovePending(pendingUser)}
                      disabled={!canManageUsers}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Aprovar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleRejectPending(pendingUser)}
                      disabled={!canManageUsers}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Recusar
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="rounded-lg border border-border bg-card p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input
            placeholder="Nome (opcional)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            disabled={!canManageUsers}
          />
          <Input
            type="email"
            placeholder="E-mail"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            disabled={!canManageUsers}
          />
          <Select
            value={newRole}
            onValueChange={(value) => setNewRole(value as RoleId)}
            disabled={!canManageUsers}
          >
            <SelectTrigger>
              <SelectValue placeholder="Perfil" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="proprietario">Proprietário</SelectItem>
              <SelectItem value="administrativo">Administrativo</SelectItem>
              <SelectItem value="visualizador">Visualizador</SelectItem>
              <SelectItem value="sem_perfil">Sem perfil</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Button onClick={handleCreate} disabled={!canManageUsers}>
            <UserPlus className="w-4 h-4 mr-2" />
            Adicionar usuário
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="text-left p-3 font-medium">E-mail</th>
              <th className="text-left p-3 font-medium">Nome</th>
              <th className="text-left p-3 font-medium">Perfil</th>
              <th className="text-left p-3 font-medium">Ativo</th>
              <th className="text-right p-3 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {activeOrRejectedUsers.map((user) => (
              <tr key={user.id} className="border-t border-border">
                <td className="p-3">{user.email}</td>
                <td className="p-3">{user.nome || "-"}</td>
                <td className="p-3">
                  <Select
                    value={user.cargo}
                    onValueChange={(value) => handleRoleChange(user.id, value as RoleId)}
                    disabled={!canManageUsers || user.cargo === "proprietario"}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="proprietario">Proprietário</SelectItem>
                      <SelectItem value="administrativo">Administrativo</SelectItem>
                      <SelectItem value="visualizador">Visualizador</SelectItem>
                      <SelectItem value="sem_perfil">Sem perfil</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={user.ativo}
                      disabled={!canManageUsers || user.cargo === "proprietario"}
                      onCheckedChange={(checked) => handleActiveChange(user.id, checked)}
                    />
                    <span className="text-xs text-muted-foreground">{user.ativo ? "Ativo" : "Inativo"}</span>
                  </div>
                  {user.approvalStatus === "recusado" && (
                    <div className="text-[11px] text-amber-600 mt-1">Cadastro recusado</div>
                  )}
                </td>
                <td className="p-3 text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(user.id, user.email)}
                    disabled={!canManageUsers || user.cargo === "proprietario"}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </td>
              </tr>
            ))}
            {activeOrRejectedUsers.length === 0 && (
              <tr>
                <td className="p-4 text-center text-muted-foreground" colSpan={5}>
                  Nenhum usuário cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {!canManageUsers && (
        <p className="text-xs text-muted-foreground">
          Você não tem permissão para gerenciar usuários.
        </p>
      )}
      {canManageUsers && (
        <p className="text-xs text-muted-foreground">
          Usuários em Sem perfil autenticam, mas precisam de liberação de perfil para acessar funcionalidades.
        </p>
      )}
    </div>
  );
};

export default UsersTab;
