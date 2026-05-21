INSERT INTO storage.buckets (id, name, public)
VALUES ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Site assets public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'site-assets');

CREATE POLICY "Admins upload site assets"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'site-assets' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins update site assets"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'site-assets' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins delete site assets"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'site-assets' AND public.has_role(auth.uid(), 'admin'::app_role));
