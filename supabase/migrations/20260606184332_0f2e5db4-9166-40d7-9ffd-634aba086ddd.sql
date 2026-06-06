
-- 1. Submissions: tighten author UPDATE (no self-publish)
DROP POLICY IF EXISTS "Users update own draft" ON public.submissions;
CREATE POLICY "Users update own draft"
  ON public.submissions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status IN ('draft','revision_requested','submitted'))
  WITH CHECK (auth.uid() = user_id AND status IN ('draft','submitted'));

-- 2. Submissions: enforce membership server-side on INSERT
DROP POLICY IF EXISTS "Users create own submissions" ON public.submissions;
CREATE POLICY "Users create own submissions"
  ON public.submissions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND status IN ('draft','submitted')
    AND (
      EXISTS (SELECT 1 FROM public.membership_payments mp WHERE mp.user_id = auth.uid() AND mp.status = 'approved')
      OR public.has_role(auth.uid(), 'admin')
      OR public.has_role(auth.uid(), 'moderator')
    )
  );

-- 3. user_roles: restrict to authenticated (no anon)
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins manage roles" ON public.user_roles;
CREATE POLICY "Users can view own roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles"
  ON public.user_roles
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4. Manuscripts bucket: add UPDATE policy mirroring INSERT
DROP POLICY IF EXISTS "Authors update own manuscripts" ON storage.objects;
CREATE POLICY "Authors update own manuscripts"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'manuscripts' AND (auth.uid())::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'manuscripts' AND (auth.uid())::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Staff manage manuscripts" ON storage.objects;
CREATE POLICY "Staff manage manuscripts"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'manuscripts' AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'moderator')))
  WITH CHECK (bucket_id = 'manuscripts' AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'moderator')));

-- 5. Payment-receipts bucket: admin/moderator UPDATE & DELETE
DROP POLICY IF EXISTS "Staff update payment receipts" ON storage.objects;
CREATE POLICY "Staff update payment receipts"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'payment-receipts' AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'moderator')))
  WITH CHECK (bucket_id = 'payment-receipts' AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'moderator')));

DROP POLICY IF EXISTS "Staff delete payment receipts" ON storage.objects;
CREATE POLICY "Staff delete payment receipts"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'payment-receipts' AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'moderator')));
