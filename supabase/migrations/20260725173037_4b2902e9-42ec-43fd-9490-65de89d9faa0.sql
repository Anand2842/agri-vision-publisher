
ALTER TABLE public.submissions
  ADD COLUMN IF NOT EXISTS salutation text,
  ADD COLUMN IF NOT EXISTS author_name text,
  ADD COLUMN IF NOT EXISTS author_email text,
  ADD COLUMN IF NOT EXISTS contact_number text,
  ADD COLUMN IF NOT EXISTS co_authors text;

-- Recreate guest insert policy to also require author identity fields
DROP POLICY IF EXISTS "Guests create submissions" ON public.submissions;
CREATE POLICY "Guests create submissions"
  ON public.submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    user_id IS NULL
    AND status = 'submitted'::submission_status
    AND guest_name IS NOT NULL AND btrim(guest_name) <> ''
    AND guest_email IS NOT NULL AND guest_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND author_name IS NOT NULL AND btrim(author_name) <> ''
    AND author_email IS NOT NULL AND author_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND contact_number IS NOT NULL AND btrim(contact_number) <> ''
  );
