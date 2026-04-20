/**
 * Executa `supabase db push` com variáveis do `.env` mescladas (ex.: SUPABASE_ACCESS_TOKEN).
 * Também funciona se você já tiver feito `npx supabase login` (token fora do .env).
 */
import { spawnSync } from "node:child_process";
import { loadEnvFile, root } from "./supabase-shared.mjs";

const fromFile = loadEnvFile();
for (const [k, v] of Object.entries(fromFile)) {
  if (process.env[k] === undefined || process.env[k] === "") {
    process.env[k] = v;
  }
}

// PAT do CLI: preferir SUPABASE_ACCESS_TOKEN no .env. Se ausente e VITE_* for sbp_…, usar só em memória (não grava .env).
const pat = process.env.SUPABASE_ACCESS_TOKEN?.trim();
const vitePub = process.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
if (!pat && vitePub?.startsWith("sbp_")) {
  process.env.SUPABASE_ACCESS_TOKEN = vitePub;
  console.warn(
    "[supabase:db:push] Usando VITE_SUPABASE_PUBLISHABLE_KEY como token do CLI (formato sbp_). " +
      "Recomendado: linha própria SUPABASE_ACCESS_TOKEN=… e chave anon/public do projeto em VITE_SUPABASE_PUBLISHABLE_KEY."
  );
}

const result = spawnSync("npx", ["supabase", "db", "push"], {
  cwd: root,
  stdio: "inherit",
  shell: true,
  env: process.env,
});

if (result.status !== 0 && !process.env.SUPABASE_ACCESS_TOKEN?.trim() && !vitePub?.startsWith("sbp_")) {
  console.error(
    "\nO CLI precisa de SUPABASE_ACCESS_TOKEN no .env (Dashboard → Account → Access Tokens).\n" +
      "Chaves VITE_* (anon/publishable) não substituem o token do CLI para `db push`.\n" +
      "Alternativa: `npx supabase login` neste usuário do sistema."
  );
}

process.exit(result.status === 0 ? 0 : result.status ?? 1);
