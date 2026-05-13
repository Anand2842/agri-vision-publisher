ALTER TABLE public.articles DROP CONSTRAINT articles_author_id_fkey;
ALTER TABLE public.articles
  ADD CONSTRAINT articles_author_id_fkey
    FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.submissions DROP CONSTRAINT submissions_user_id_fkey;
ALTER TABLE public.submissions
  ADD CONSTRAINT submissions_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_articles_author_id      ON public.articles(author_id);
CREATE INDEX IF NOT EXISTS idx_articles_category_id    ON public.articles(category_id);
CREATE INDEX IF NOT EXISTS idx_articles_issue_id       ON public.articles(issue_id);
CREATE INDEX IF NOT EXISTS idx_submissions_user_id     ON public.submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_category_id ON public.submissions(category_id);