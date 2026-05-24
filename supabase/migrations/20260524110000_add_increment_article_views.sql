-- Secure RPC function to increment article view counts by bypassing RLS restrictions for public readers
CREATE OR REPLACE FUNCTION public.increment_article_views(article_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.articles
  SET views = views + 1
  WHERE id = article_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution rights to anonymous guests and authenticated users
GRANT EXECUTE ON FUNCTION public.increment_article_views(UUID) TO anon, authenticated;
