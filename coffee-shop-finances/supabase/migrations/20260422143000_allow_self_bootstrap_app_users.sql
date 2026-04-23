-- Allow first authenticated access to bootstrap own app_users row.
DROP POLICY IF EXISTS "app_users_insert_manager" ON public.app_users;

CREATE POLICY "app_users_insert_self_or_manager"
ON public.app_users
FOR INSERT
WITH CHECK (
  id = auth.uid()
  OR public.has_permission('users.manage')
);
