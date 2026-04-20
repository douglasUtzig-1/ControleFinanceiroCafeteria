import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

export const PROJECT_REF = "gwsuvkcbgczihtqcjjux";
export const PROJECT_URL = `https://${PROJECT_REF}.supabase.co`;
export const ENV_PATH = path.join(root, ".env");
export const CONFIG_PATH = path.join(root, "supabase", "config.toml");

export function parseEnv(text) {
  const out = {};
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

export function loadEnvFile() {
  if (!fs.existsSync(ENV_PATH)) return {};
  return parseEnv(fs.readFileSync(ENV_PATH, "utf8"));
}

/** Chaves VITE_* que o check de Supabase e o Vite usam no frontend. */
export const VITE_SUPABASE_ENV_KEYS = [
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_PUBLISHABLE_KEY",
  "VITE_SUPABASE_ANON_KEY",
  "VITE_SUPABASE_PROJECT_ID",
  "VITE_SUPABASE_SERVICE_ROLE_KEY",
];

/**
 * Mescla .env com process.env: valores não vazios em process sobrescrevem o arquivo
 * (útil na Vercel/CI, onde não há .env commitado).
 */
export function loadEffectiveSupabaseEnv() {
  const fromFile = loadEnvFile();
  const out = { ...fromFile };
  for (const key of VITE_SUPABASE_ENV_KEYS) {
    const v = process.env[key];
    if (typeof v === "string" && v.trim() !== "") {
      out[key] = v.trim();
    }
  }
  return out;
}

export function loadProjectRefFromConfig() {
  if (!fs.existsSync(CONFIG_PATH)) return null;
  const text = fs.readFileSync(CONFIG_PATH, "utf8");
  const match = text.match(/project_id\s*=\s*"([^"]+)"/);
  return match?.[1] ?? null;
}

export function isNonEmpty(value) {
  return typeof value === "string" && value.trim() !== "";
}

export { root };
