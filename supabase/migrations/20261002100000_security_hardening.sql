-- Security hardening (audit, Oct 2026). Safe to re-run.

-- 1. Remove the test accounts seeded with plaintext passwords in
--    20260522064044_*.sql. profiles / user_roles rows cascade; articles.author_id
--    is set to NULL.
DELETE FROM auth.users
WHERE email IN ('admin@test.lovable.dev', 'mod@test.lovable.dev', 'author@test.lovable.dev');

-- 2. The legacy public 'receipts' bucket exposed payment proofs to anyone.
--    The app now uses the private 'payment-receipts' bucket only.
DROP POLICY IF EXISTS "Public receipts read" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated receipts upload" ON storage.objects;
UPDATE storage.buckets SET public = false WHERE id = 'receipts';

-- 3. Server-side upload limits (guests can upload to manuscripts/guest/ without an account).
UPDATE storage.buckets
SET file_size_limit = 10485760, -- 10 MB
    allowed_mime_types = ARRAY[
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
WHERE id = 'manuscripts';

UPDATE storage.buckets
SET file_size_limit = 5242880, -- 5 MB
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'application/pdf']
WHERE id = 'payment-receipts';

-- 4. View counter: pin search_path (SECURITY DEFINER) and only count published articles.
CREATE OR REPLACE FUNCTION public.increment_article_views(article_id UUID)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.articles SET views = views + 1
  WHERE id = article_id AND status = 'published';
$$;
GRANT EXECUTE ON FUNCTION public.increment_article_views(UUID) TO anon, authenticated;
