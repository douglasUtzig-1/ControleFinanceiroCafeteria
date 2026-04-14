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
