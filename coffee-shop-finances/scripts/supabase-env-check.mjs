/**
 * Valida consistência da configuração Supabase antes de dev/build/test.
 * Uso: node scripts/supabase-env-check.mjs
 */
import fs from "node:fs";
import {
  CONFIG_PATH,
  ENV_PATH,
  PROJECT_REF,
  PROJECT_URL,
  loadEffectiveSupabaseEnv,
  loadProjectRefFromConfig,
  isNonEmpty,
} from "./supabase-shared.mjs";

function fail(message) {
  console.error(`ERRO: ${message}`);
  process.exit(1);
}

function warn(message) {
  console.warn(`AVISO: ${message}`);
}

function main() {
  if (!fs.existsSync(CONFIG_PATH)) fail("Arquivo supabase/config.toml ausente.");
  const configProjectRef = loadProjectRefFromConfig();
  if (!configProjectRef) fail("project_id ausente em supabase/config.toml.");
  if (configProjectRef !== PROJECT_REF) {
    fail(`project_id inválido em supabase/config.toml: ${configProjectRef}. Esperado: ${PROJECT_REF}.`);
  }

  const hasEnvFile = fs.existsSync(ENV_PATH);
  if (!hasEnvFile) {
    warn("Arquivo .env ausente; usando variáveis de ambiente (ex.: Vercel/CI).");
  }

  const env = loadEffectiveSupabaseEnv();
  const url = env.VITE_SUPABASE_URL;
  const publishable = env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const anonAlias = env.VITE_SUPABASE_ANON_KEY;
  const projectId = env.VITE_SUPABASE_PROJECT_ID;
  const serviceRole = env.VITE_SUPABASE_SERVICE_ROLE_KEY;

  if (!isNonEmpty(url)) {
    fail(
      "VITE_SUPABASE_URL ausente. Local: copie .env.example para .env. Vercel/CI: defina nas Environment Variables."
    );
  }
  if (!isNonEmpty(publishable) && !isNonEmpty(anonAlias)) {
    fail(
      "Defina VITE_SUPABASE_PUBLISHABLE_KEY (ou VITE_SUPABASE_ANON_KEY) no .env ou nas variáveis de ambiente do deploy."
    );
  }
  if (isNonEmpty(publishable) && isNonEmpty(anonAlias) && publishable !== anonAlias) {
    fail("VITE_SUPABASE_PUBLISHABLE_KEY e VITE_SUPABASE_ANON_KEY divergem.");
  }
  if (isNonEmpty(serviceRole)) {
    fail("VITE_SUPABASE_SERVICE_ROLE_KEY não deve existir no frontend.");
  }
  if (!url.includes(PROJECT_REF)) {
    fail(`VITE_SUPABASE_URL inválida: esperado domínio ${PROJECT_URL}.`);
  }
  if (isNonEmpty(projectId) && projectId !== PROJECT_REF) {
    fail(`VITE_SUPABASE_PROJECT_ID inválido: ${projectId}. Esperado: ${PROJECT_REF}.`);
  }
  if (!isNonEmpty(projectId)) {
    warn(`Defina VITE_SUPABASE_PROJECT_ID=${PROJECT_REF} para validação extra.`);
  }

  console.log("OK: configuração Supabase consistente com o projeto oficial.");
}

main();
