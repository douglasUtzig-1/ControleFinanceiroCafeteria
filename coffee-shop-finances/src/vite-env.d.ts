/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  /** Chave anon (pública) — nome usado no template Lovable */
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  /** Mesma chave anon; alias comum na documentação Supabase */
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_SUPABASE_PROJECT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
