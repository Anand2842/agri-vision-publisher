DROP POLICY IF EXISTS "Guests create submissions" ON public.submissions;
CREATE POLICY "Guests create submissions"
  ON public.submissions FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    user_id IS NULL
    AND status = 'submitted'::submission_status
    AND guest_name IS NOT NULL
    AND btrim(guest_name) <> ''
    AND guest_email IS NOT NULL
    AND guest_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  );