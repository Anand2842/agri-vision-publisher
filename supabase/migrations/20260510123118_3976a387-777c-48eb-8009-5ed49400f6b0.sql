
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS pdf_url text;

INSERT INTO storage.buckets (id, name, public)
VALUES ('article-pdfs', 'article-pdfs', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Article PDFs public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'article-pdfs');

CREATE POLICY "Admins upload article PDFs"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'article-pdfs' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins update article PDFs"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'article-pdfs' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins delete article PDFs"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'article-pdfs' AND public.has_role(auth.uid(), 'admin'::app_role));
