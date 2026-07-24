
ALTER TABLE public.submissions ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS guest_name text;
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS guest_email text;
ALTER TABLE public.submissions ADD CONSTRAINT submissions_owner_or_guest_chk
  CHECK (
    user_id IS NOT NULL
    OR (guest_name IS NOT NULL AND btrim(guest_name) <> ''
        AND guest_email IS NOT NULL AND guest_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
  );

DROP POLICY IF EXISTS "Users create own submissions" ON public.submissions;

CREATE POLICY "Users create own submissions"
  ON public.submissions FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND status IN ('draft','submitted')
  );

CREATE POLICY "Guests create submissions"
  ON public.submissions FOR INSERT TO anon
  WITH CHECK (
    user_id IS NULL
    AND status = 'submitted'
    AND guest_name IS NOT NULL AND btrim(guest_name) <> ''
    AND guest_email IS NOT NULL AND guest_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  );

GRANT INSERT ON public.submissions TO anon;

-- Storage: allow guests to upload manuscripts under the 'guest/' folder only
DROP POLICY IF EXISTS "Guests upload manuscripts" ON storage.objects;
CREATE POLICY "Guests upload manuscripts"
  ON storage.objects FOR INSERT TO anon
  WITH CHECK (
    bucket_id = 'manuscripts'
    AND (storage.foldername(name))[1] = 'guest'
  );
