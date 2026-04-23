-- User approval workflow metadata and status synchronization.
ALTER TABLE public.app_users
    ADD COLUMN IF NOT EXISTS approval_status TEXT NOT NULL DEFAULT 'ativo',
    ADD COLUMN IF NOT EXISTS approved_by UUID,
    ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS rejected_by UUID,
    ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

ALTER TABLE public.auth_local_users
    ADD COLUMN IF NOT EXISTS approval_status TEXT NOT NULL DEFAULT 'ativo';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'app_users_approval_status_check'
    ) THEN
        ALTER TABLE public.app_users
            ADD CONSTRAINT app_users_approval_status_check
            CHECK (approval_status IN ('pendente_aprovacao', 'ativo', 'recusado'));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'auth_local_users_approval_status_check'
    ) THEN
        ALTER TABLE public.auth_local_users
            ADD CONSTRAINT auth_local_users_approval_status_check
            CHECK (approval_status IN ('pendente_aprovacao', 'ativo', 'recusado'));
    END IF;
END $$;

-- Backfill existing records.
UPDATE public.app_users
SET approval_status = CASE
    WHEN ativo IS TRUE THEN 'ativo'
    ELSE 'recusado'
END
WHERE approval_status IS NULL
   OR approval_status NOT IN ('pendente_aprovacao', 'ativo', 'recusado');

UPDATE public.auth_local_users al
SET approval_status = au.approval_status
FROM public.app_users au
WHERE al.app_user_id = au.id
  AND (al.approval_status IS NULL OR al.approval_status NOT IN ('pendente_aprovacao', 'ativo', 'recusado'));

CREATE OR REPLACE FUNCTION public.sync_auth_local_user_approval_status()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.auth_local_users
    SET approval_status = NEW.approval_status
    WHERE app_user_id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trg_sync_auth_local_user_approval_status ON public.app_users;
CREATE TRIGGER trg_sync_auth_local_user_approval_status
AFTER UPDATE OF approval_status ON public.app_users
FOR EACH ROW
EXECUTE FUNCTION public.sync_auth_local_user_approval_status();
