/**
 * Relatório: .env, migrações locais, PostgREST + colunas esperadas (billing_data / receivables_data).
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { root } from "./supabase-shared.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const scriptsDir = __dirname;

function run(name, file) {
  console.log(`\n--- ${name} ---`);
  execSync(`node "${path.join(scriptsDir, file)}"`, { cwd: root, stdio: "inherit", env: process.env });
}

console.log("Validação Supabase (coffee-shop-finances)\n");

const migDir = path.join(root, "supabase", "migrations");
const migrations = fs.existsSync(migDir)
  ? fs.readdirSync(migDir).filter((f) => f.endsWith(".sql")).sort()
  : [];
console.log("Migrações SQL locais (supabase/migrations):");
for (const f of migrations) {
  console.log(`  • ${f}`);
}
if (migrations.length === 0) {
  console.log("  (nenhum arquivo .sql encontrado)");
}

try {
  run("Configuração .env / projeto", "supabase-env-check.mjs");
  run("Schema PostgREST (colunas)", "supabase-schema-check.mjs");
  console.log("\n✓ Validação concluída: comunicação OK e colunas alinhadas ao app.");
} catch {
  console.error(
    "\n✗ Falhou em alguma etapa. Se faltar coluna (ex.: pix_pos), aplique migrações no remoto:\n" +
      "  • Adicione SUPABASE_ACCESS_TOKEN ao .env (token em Dashboard → Account → Access Tokens)\n" +
      "  • npm run supabase:db:push\n" +
      "  • Ou rode o SQL da migração em SQL Editor no dashboard do Supabase."
  );
  process.exit(1);
}
