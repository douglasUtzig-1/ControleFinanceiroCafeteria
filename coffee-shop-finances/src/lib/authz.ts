import type { RoleId } from "@/lib/permissions";

export type AppUser = {
  id: string;
  email: string;
  nome: string | null;
  cargo: RoleId;
  ativo: boolean;
  approval_status?: "pendente_aprovacao" | "ativo" | "recusado";
};
