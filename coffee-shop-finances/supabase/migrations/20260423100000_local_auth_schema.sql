-- Local authentication model (independent from Supabase Auth).
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.auth_local_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    password_salt TEXT NOT NULL,
    password_iterations INTEGER NOT NULL DEFAULT 120000,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    app_user_id UUID NOT NULL REFERENCES public.app_users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.auth_local_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.auth_local_users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    ip TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auth_local_users_email
    ON public.auth_local_users (email);

CREATE INDEX IF NOT EXISTS idx_auth_local_sessions_token_hash
    ON public.auth_local_sessions (token_hash);

CREATE INDEX IF NOT EXISTS idx_auth_local_sessions_user_id
    ON public.auth_local_sessions (user_id);

CREATE OR REPLACE FUNCTION public.update_auth_local_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS update_auth_local_users_updated_at ON public.auth_local_users;
CREATE TRIGGER update_auth_local_users_updated_at
    BEFORE UPDATE ON public.auth_local_users
    FOR EACH ROW EXECUTE FUNCTION public.update_auth_local_users_updated_at();

-- Seed app user and local credentials for initial access.
INSERT INTO public.app_users (id, email, nome, cargo, ativo)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'douglasutzig.1@gmail.com',
    'Douglas Utzig',
    'proprietario',
    TRUE
)
ON CONFLICT (email) DO UPDATE
SET nome = EXCLUDED.nome,
    cargo = EXCLUDED.cargo,
    ativo = EXCLUDED.ativo;

INSERT INTO public.auth_local_users (email, password_hash, password_salt, password_iterations, is_active, app_user_id)
SELECT
    'douglasutzig.1@gmail.com',
    '0791f4ab585749d4e35f35022a517a46428b3fd2b1efb2d3d943582f1f1fa035',
    '865f2925a1f324bd8b6e48cf87ae8c1b',
    120000,
    TRUE,
    au.id
FROM public.app_users au
WHERE au.email = 'douglasutzig.1@gmail.com'
ON CONFLICT (email) DO UPDATE
SET is_active = EXCLUDED.is_active,
    app_user_id = EXCLUDED.app_user_id;

-- This first version uses app-level auth (Edge Function + local session token).
-- Keep local auth tables inaccessible via direct client queries.
ALTER TABLE public.auth_local_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_local_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deny_all_auth_local_users" ON public.auth_local_users;
CREATE POLICY "deny_all_auth_local_users"
ON public.auth_local_users
FOR ALL
USING (FALSE)
WITH CHECK (FALSE);

DROP POLICY IF EXISTS "deny_all_auth_local_sessions" ON public.auth_local_sessions;
CREATE POLICY "deny_all_auth_local_sessions"
ON public.auth_local_sessions
FOR ALL
USING (FALSE)
WITH CHECK (FALSE);

-- Temporary compatibility policy set for app data while auth is app-managed.
DROP POLICY IF EXISTS "billing_select_by_permission" ON public.billing_data;
DROP POLICY IF EXISTS "billing_insert_by_permission" ON public.billing_data;
DROP POLICY IF EXISTS "billing_update_by_permission" ON public.billing_data;
DROP POLICY IF EXISTS "billing_delete_by_permission" ON public.billing_data;

DROP POLICY IF EXISTS "receivables_select_by_permission" ON public.receivables_data;
DROP POLICY IF EXISTS "receivables_insert_by_permission" ON public.receivables_data;
DROP POLICY IF EXISTS "receivables_update_by_permission" ON public.receivables_data;
DROP POLICY IF EXISTS "receivables_delete_by_permission" ON public.receivables_data;

DROP POLICY IF EXISTS "roles_select_for_management" ON public.roles;
DROP POLICY IF EXISTS "permissions_select_for_management" ON public.permissions;
DROP POLICY IF EXISTS "role_permissions_select_for_management" ON public.role_permissions;
DROP POLICY IF EXISTS "role_permissions_manage_for_profiles" ON public.role_permissions;
DROP POLICY IF EXISTS "app_users_select_self_or_manager" ON public.app_users;
DROP POLICY IF EXISTS "app_users_insert_self_or_manager" ON public.app_users;
DROP POLICY IF EXISTS "app_users_update_self_or_manager" ON public.app_users;
DROP POLICY IF EXISTS "app_users_delete_manager" ON public.app_users;

CREATE POLICY "billing_allow_all_while_local_auth"
ON public.billing_data
FOR ALL
USING (TRUE)
WITH CHECK (TRUE);

CREATE POLICY "receivables_allow_all_while_local_auth"
ON public.receivables_data
FOR ALL
USING (TRUE)
WITH CHECK (TRUE);

CREATE POLICY "roles_allow_read"
ON public.roles
FOR SELECT
USING (TRUE);

CREATE POLICY "permissions_allow_read"
ON public.permissions
FOR SELECT
USING (TRUE);

CREATE POLICY "role_permissions_allow_all"
ON public.role_permissions
FOR ALL
USING (TRUE)
WITH CHECK (TRUE);

CREATE POLICY "app_users_allow_all"
ON public.app_users
FOR ALL
USING (TRUE)
WITH CHECK (TRUE);
