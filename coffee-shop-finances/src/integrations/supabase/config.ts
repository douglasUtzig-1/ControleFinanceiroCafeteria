const SUPABASE_PROJECT_ID = "gwsuvkcbgczihtqcjjux";
const SUPABASE_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co`;

type SupabaseEnvValidation = {
  isConfigured: boolean;
  url?: string;
  anonKey?: string;
  errors: string[];
  warnings: string[];
};

export const SUPABASE_SETUP_HELP =
  "Crie o arquivo .env na pasta do projeto com VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY " +
  `(chave anon em https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/settings/api ). ` +
  "Use .env.example como modelo e reinicie o npm run dev.";

function isNonEmpty(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== "";
}

export function validateSupabaseClientEnv(): SupabaseEnvValidation {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const publishable = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const anonAlias = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const serviceRole = (import.meta.env as Record<string, string | undefined>).VITE_SUPABASE_SERVICE_ROLE_KEY;

  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isNonEmpty(url)) errors.push("VITE_SUPABASE_URL ausente.");
  if (!isNonEmpty(publishable) && !isNonEmpty(anonAlias)) {
    errors.push("Defina VITE_SUPABASE_PUBLISHABLE_KEY (ou VITE_SUPABASE_ANON_KEY).");
  }
  if (isNonEmpty(publishable) && isNonEmpty(anonAlias) && publishable !== anonAlias) {
    errors.push("VITE_SUPABASE_PUBLISHABLE_KEY e VITE_SUPABASE_ANON_KEY divergem.");
  }

  if (isNonEmpty(url) && !url.includes(SUPABASE_PROJECT_ID)) {
    errors.push(`VITE_SUPABASE_URL deve apontar para ${SUPABASE_URL}.`);
  }
  if (isNonEmpty(projectId) && projectId !== SUPABASE_PROJECT_ID) {
    errors.push(`VITE_SUPABASE_PROJECT_ID inválido: esperado ${SUPABASE_PROJECT_ID}.`);
  }
  if (isNonEmpty(serviceRole)) {
    errors.push("VITE_SUPABASE_SERVICE_ROLE_KEY não deve ser exposta no frontend.");
  }
  if (!isNonEmpty(projectId)) {
    warnings.push(`Recomendado definir VITE_SUPABASE_PROJECT_ID=${SUPABASE_PROJECT_ID}.`);
  }

  const resolvedKey = isNonEmpty(publishable) ? publishable : isNonEmpty(anonAlias) ? anonAlias : undefined;
  return {
    isConfigured: errors.length === 0 && isNonEmpty(url) && isNonEmpty(resolvedKey),
    url: isNonEmpty(url) ? url : undefined,
    anonKey: resolvedKey,
    errors,
    warnings,
  };
}

export { SUPABASE_PROJECT_ID, SUPABASE_URL };
