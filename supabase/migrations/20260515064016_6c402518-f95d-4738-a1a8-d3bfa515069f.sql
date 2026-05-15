-- Manuscript file column on submissions
ALTER TABLE public.submissions
  ADD COLUMN IF NOT EXISTS manuscript_path text;

-- Private bucket for author Word manuscripts
INSERT INTO storage.buckets (id, name, public)
VALUES ('manuscripts', 'manuscripts', false)
ON CONFLICT (id) DO NOTHING;

-- Owner upload (path must start with auth.uid()/...)
CREATE POLICY "Authors upload own manuscripts"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'manuscripts'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Owner read
CREATE POLICY "Authors read own manuscripts"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'manuscripts'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Admin / moderator read everything in this bucket
CREATE POLICY "Staff read all manuscripts"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'manuscripts'
  AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'))
);

-- Owner delete (so authors can replace)
CREATE POLICY "Authors delete own manuscripts"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'manuscripts'
  AND auth.uid()::text = (storage.foldername(name))[1]
);