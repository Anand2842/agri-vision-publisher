DROP POLICY IF EXISTS "Users create own submissions" ON public.submissions;
CREATE POLICY "Users create own submissions"
  ON public.submissions FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND status = ANY (ARRAY['draft'::submission_status, 'submitted'::submission_status])
  );

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users WHERE email = 'dkdkdangi@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;