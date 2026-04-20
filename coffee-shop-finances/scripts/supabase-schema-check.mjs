/**
 * Verifica .env, conexão PostgREST e colunas esperadas pelo app.
 * Uso: node scripts/supabase-schema-check.mjs
 */
import fs from "node:fs";
import {
  ENV_PATH,
  PROJECT_REF,
  PROJECT_URL,
  loadEffectiveSupabaseEnv,
  isNonEmpty,
} from "./supabase-shared.mjs";

async function selectTable(baseUrl, key, table, columns) {
  const url = `${baseUrl.replace(/\/$/, "")}/rest/v1/${table}?select=${encodeURIComponent(columns)}&limit=1`;
  const res = await fetch(url, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Accept: "application/json",
    },
  });
  const text = await res.text();
  return { ok: res.ok, status: res.status, table, body: text };
}

async function main() {
  if (!fs.existsSync(ENV_PATH)) {
    console.warn("AVISO: .env ausente; usando variáveis de ambiente (ex.: Vercel/CI).");
  }

  const env = loadEffectiveSupabaseEnv();
  const url = env.VITE_SUPABASE_URL;
  const publishableKey = env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const anonAliasKey = env.VITE_SUPABASE_ANON_KEY;
  const key = publishableKey || anonAliasKey;
  const envProjectRef = env.VITE_SUPABASE_PROJECT_ID;

  if (!url || !key || !isNonEmpty(url) || !isNonEmpty(key)) {
    console.error(
      "Defina VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY (ou ANON_KEY) no .env ou nas variáveis de ambiente (Settings → API no Supabase)."
    );
    process.exit(1);
  }

  if (publishableKey && anonAliasKey && publishableKey !== anonAliasKey) {
    console.error("VITE_SUPABASE_PUBLISHABLE_KEY e VITE_SUPABASE_ANON_KEY divergem.");
    process.exit(1);
  }

  if (!url.includes(PROJECT_REF)) {
    console.error(`VITE_SUPABASE_URL não aponta para o projeto oficial (${PROJECT_URL}).`);
    process.exit(1);
  }
  if (envProjectRef && envProjectRef !== PROJECT_REF) {
    console.error(`VITE_SUPABASE_PROJECT_ID inválido: ${envProjectRef}. Esperado: ${PROJECT_REF}.`);
    process.exit(1);
  }

  const checks = [
    {
      table: "billing_data",
      columns:
        "data,abertura,fechamento,qtde_vendas,dinheiro,pix,credito,debito,qr_code,pix_pos,retirada,transferencia,debito_bruto,debito_liquido,credito_bruto,credito_liquido,debito_pos,credito_pos,total_credito_sistema_pos,observacoes,created_at,updated_at",
    },
    {
      table: "receivables_data",
      columns:
        "data,recebido_itau_debito,recebido_itau_credito,recebido_itau_pix,deposito_dinheiro,recebido_rede_debito_bruto,recebido_rede_credito_bruto,taxa_tarifa,recebido_total_liquido,created_at,updated_at",
    },
  ];

  for (const item of checks) {
    const { ok, status, table: t, body } = await selectTable(url, key, item.table, item.columns);
    if (!ok) {
      console.error(`Falha ${t}: HTTP ${status} (verifique migrações, colunas e RLS). Resposta: ${body}`);
      try {
        const j = JSON.parse(body);
        if (j.message?.includes("pix_pos")) {
          console.error(
            "Dica: a coluna pix_pos ainda não existe no Postgres remoto. Rode `npm run supabase:db:push` com SUPABASE_ACCESS_TOKEN no .env, ou aplique a migração manualmente no SQL Editor."
          );
        }
      } catch {
        /* ignore JSON parse */
      }
      process.exit(1);
    }
    console.log(`OK ${t}: HTTP ${status} (colunas válidas)`);
  }

  console.log("Schema acessível e sincronizado para billing_data e receivables_data.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
