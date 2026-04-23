-- Adds a no-permissions role for self-registered users awaiting approval.
INSERT INTO public.roles (id, name)
VALUES ('sem_perfil', 'Sem perfil')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
