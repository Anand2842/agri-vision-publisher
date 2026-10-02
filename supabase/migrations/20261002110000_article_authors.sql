-- Authors are stored on the article itself, so guest submissions and imported
-- articles show real names instead of "Editorial Team". author_id stays as the
-- optional link to a registered account.
ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS authors text,
  ADD COLUMN IF NOT EXISTS affiliation text;

-- Schema drift: these columns exist in the live DB but no migration created them.
ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS page_start integer,
  ADD COLUMN IF NOT EXISTS page_end integer;
