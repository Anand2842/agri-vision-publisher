DO $$
DECLARE
  admin_id uuid := gen_random_uuid();
  mod_id   uuid := gen_random_uuid();
  auth_id  uuid := gen_random_uuid();
  rec record;
BEGIN
  FOR rec IN
    SELECT * FROM (VALUES
      (admin_id, 'admin@test.lovable.dev',  'AdminTest!2026',  'Test Admin',     'admin'::public.app_role),
      (mod_id,   'mod@test.lovable.dev',    'ModTest!2026',    'Test Moderator', 'moderator'::public.app_role),
      (auth_id,  'author@test.lovable.dev', 'AuthorTest!2026', 'Test Author',    'author'::public.app_role)
    ) AS t(uid, email, pwd, full_name, role)
  LOOP
    -- Skip if email already exists
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = rec.email) THEN
      CONTINUE;
    END IF;

    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change,
      email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      rec.uid,
      'authenticated',
      'authenticated',
      rec.email,
      crypt(rec.pwd, gen_salt('bf')),
      now(),
      jsonb_build_object('provider','email','providers',ARRAY['email']),
      jsonb_build_object('full_name', rec.full_name),
      now(), now(), '', '', '', ''
    );

    INSERT INTO auth.identities (
      id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(),
      rec.uid,
      rec.uid::text,
      jsonb_build_object('sub', rec.uid::text, 'email', rec.email, 'email_verified', true),
      'email',
      now(), now(), now()
    );

    -- Ensure profile exists (trigger handle_new_user should create, but be defensive)
    INSERT INTO public.profiles (id, full_name)
    VALUES (rec.uid, rec.full_name)
    ON CONFLICT (id) DO NOTHING;

    -- Add the target role (trigger adds 'author' by default; add target role too)
    INSERT INTO public.user_roles (user_id, role)
    VALUES (rec.uid, rec.role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END LOOP;
END $$;