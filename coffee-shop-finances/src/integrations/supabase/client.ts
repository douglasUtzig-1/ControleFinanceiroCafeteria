import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { SUPABASE_SETUP_HELP, validateSupabaseClientEnv } from './config';

const envValidation = validateSupabaseClientEnv();
const key = envValidation.anonKey;
const url = envValidation.url;

export const isSupabaseConfigured = Boolean(url && key);
export { SUPABASE_SETUP_HELP };

let client: SupabaseClient<Database> | null = null;

/** Cliente real ou null se o .env não estiver configurado — não lança na importação do módulo. */
export function getSupabase(): SupabaseClient<Database> | null {
  if (!isSupabaseConfigured || !url || !key) return null;
  if (!client) {
    client = createClient<Database>(url, key, {
      auth: {
        storage: localStorage,
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return client;
}
