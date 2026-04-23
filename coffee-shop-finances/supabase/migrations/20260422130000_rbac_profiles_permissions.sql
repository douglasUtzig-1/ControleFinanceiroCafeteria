-- RBAC base model for profiles and permissions
CREATE TABLE IF NOT EXISTS public.roles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.permissions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.role_permissions (
    role_id TEXT NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id TEXT NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS public.app_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    nome TEXT,
    cargo TEXT NOT NULL DEFAULT 'visualizador',
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.app_users
    ADD COLUMN IF NOT EXISTS nome TEXT,
    ADD COLUMN IF NOT EXISTS cargo TEXT NOT NULL DEFAULT 'visualizador',
    ADD COLUMN IF NOT EXISTS ativo BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE public.billing_data
    ADD COLUMN IF NOT EXISTS user_id UUID;

ALTER TABLE public.receivables_data
    ADD COLUMN IF NOT EXISTS user_id UUID;

ALTER TABLE public.billing_data
    ALTER COLUMN user_id SET DEFAULT auth.uid();

ALTER TABLE public.receivables_data
    ALTER COLUMN user_id SET DEFAULT auth.uid();

INSERT INTO public.roles (id, name)
VALUES
    ('proprietario', 'Proprietário'),
    ('administrativo', 'Administrativo'),
    ('visualizador', 'Visualizador')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO public.permissions (id, name)
VALUES
    ('dashboard.view', 'Pode visualizar dashboard'),
    ('dashboard.edit', 'Pode editar dashboard'),
    ('billing.view', 'Pode visualizar faturamento'),
    ('billing.edit', 'Pode editar faturamento'),
    ('reports.view', 'Pode visualizar relatórios'),
    ('settings.view', 'Pode visualizar configurações'),
    ('profiles.manage', 'Pode gerenciar perfis'),
    ('users.manage', 'Pode gerenciar usuários')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO public.role_permissions (role_id, permission_id)
VALUES
    -- Proprietário: acesso irrestrito por permissão explícita + bypass em função
    ('proprietario', 'dashboard.view'),
    ('proprietario', 'dashboard.edit'),
    ('proprietario', 'billing.view'),
    ('proprietario', 'billing.edit'),
    ('proprietario', 'reports.view'),
    ('proprietario', 'settings.view'),
    ('proprietario', 'profiles.manage'),
    ('proprietario', 'users.manage'),
    -- Administrativo
    ('administrativo', 'dashboard.view'),
    ('administrativo', 'billing.view'),
    ('administrativo', 'billing.edit'),
    ('administrativo', 'reports.view'),
    ('administrativo', 'settings.view'),
    ('administrativo', 'users.manage'),
    -- Visualizador
    ('visualizador', 'dashboard.view'),
    ('visualizador', 'billing.view'),
    ('visualizador', 'reports.view')
ON CONFLICT (role_id, permission_id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT
LANGUAGE SQL
STABLE
AS $$
    SELECT COALESCE((
        SELECT au.cargo
        FROM public.app_users au
        WHERE au.id = auth.uid()
          AND au.ativo = TRUE
        LIMIT 1
    ), '')
$$;

CREATE OR REPLACE FUNCTION public.has_permission(permission_id TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
AS $$
    SELECT
      CASE
        WHEN auth.uid() IS NULL THEN FALSE
        WHEN NOT EXISTS (SELECT 1 FROM public.app_users) THEN TRUE
        WHEN EXISTS (
          SELECT 1
          FROM public.app_users au
          WHERE au.id = auth.uid()
            AND au.ativo = TRUE
            AND au.cargo = 'proprietario'
        ) THEN TRUE
        ELSE EXISTS (
          SELECT 1
          FROM public.app_users au
          JOIN public.role_permissions rp ON rp.role_id = au.cargo
          WHERE au.id = auth.uid()
            AND au.ativo = TRUE
            AND rp.permission_id = permission_id
        )
      END
$$;

CREATE OR REPLACE FUNCTION public.can_read_financial_data()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
AS $$
    SELECT
      public.has_permission('billing.view')
      OR public.has_permission('dashboard.view')
      OR public.has_permission('reports.view')
$$;

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receivables_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all select" ON public.billing_data;
DROP POLICY IF EXISTS "Allow all insert" ON public.billing_data;
DROP POLICY IF EXISTS "Allow all update" ON public.billing_data;
DROP POLICY IF EXISTS "Allow all delete" ON public.billing_data;

DROP POLICY IF EXISTS "Allow all select" ON public.receivables_data;
DROP POLICY IF EXISTS "Allow all insert" ON public.receivables_data;
DROP POLICY IF EXISTS "Allow all update" ON public.receivables_data;
DROP POLICY IF EXISTS "Allow all delete" ON public.receivables_data;

CREATE POLICY "billing_select_by_permission"
ON public.billing_data
FOR SELECT
USING (public.can_read_financial_data());

CREATE POLICY "billing_insert_by_permission"
ON public.billing_data
FOR INSERT
WITH CHECK (
    public.has_permission('billing.edit')
    AND (user_id IS NULL OR user_id = auth.uid())
);

CREATE POLICY "billing_update_by_permission"
ON public.billing_data
FOR UPDATE
USING (
    public.has_permission('billing.edit')
    AND (user_id IS NULL OR user_id = auth.uid())
)
WITH CHECK (
    public.has_permission('billing.edit')
    AND (user_id IS NULL OR user_id = auth.uid())
);

CREATE POLICY "billing_delete_by_permission"
ON public.billing_data
FOR DELETE
USING (
    public.has_permission('billing.edit')
    AND (user_id IS NULL OR user_id = auth.uid())
);

CREATE POLICY "receivables_select_by_permission"
ON public.receivables_data
FOR SELECT
USING (public.can_read_financial_data());

CREATE POLICY "receivables_insert_by_permission"
ON public.receivables_data
FOR INSERT
WITH CHECK (
    public.has_permission('billing.edit')
    AND (user_id IS NULL OR user_id = auth.uid())
);

CREATE POLICY "receivables_update_by_permission"
ON public.receivables_data
FOR UPDATE
USING (
    public.has_permission('billing.edit')
    AND (user_id IS NULL OR user_id = auth.uid())
)
WITH CHECK (
    public.has_permission('billing.edit')
    AND (user_id IS NULL OR user_id = auth.uid())
);

CREATE POLICY "receivables_delete_by_permission"
ON public.receivables_data
FOR DELETE
USING (
    public.has_permission('billing.edit')
    AND (user_id IS NULL OR user_id = auth.uid())
);

CREATE POLICY "roles_select_for_management"
ON public.roles
FOR SELECT
USING (public.has_permission('profiles.manage') OR public.has_permission('users.manage'));

CREATE POLICY "permissions_select_for_management"
ON public.permissions
FOR SELECT
USING (public.has_permission('profiles.manage') OR public.has_permission('users.manage'));

CREATE POLICY "role_permissions_select_for_management"
ON public.role_permissions
FOR SELECT
USING (public.has_permission('profiles.manage') OR public.has_permission('users.manage'));

CREATE POLICY "role_permissions_manage_for_profiles"
ON public.role_permissions
FOR ALL
USING (public.has_permission('profiles.manage'))
WITH CHECK (public.has_permission('profiles.manage'));

CREATE POLICY "app_users_select_self_or_manager"
ON public.app_users
FOR SELECT
USING (
    id = auth.uid()
    OR public.has_permission('users.manage')
);

CREATE POLICY "app_users_insert_manager"
ON public.app_users
FOR INSERT
WITH CHECK (public.has_permission('users.manage'));

CREATE POLICY "app_users_update_self_or_manager"
ON public.app_users
FOR UPDATE
USING (
    id = auth.uid()
    OR public.has_permission('users.manage')
)
WITH CHECK (
    id = auth.uid()
    OR public.has_permission('users.manage')
);

CREATE POLICY "app_users_delete_manager"
ON public.app_users
FOR DELETE
USING (public.has_permission('users.manage'));
