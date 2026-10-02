-- Admin actions that must succeed or fail as a whole. Safe to re-run.

-- 1. Promote an approved submission to a published article in one transaction
--    (previously two separate requests from the browser).
CREATE OR REPLACE FUNCTION public.promote_submission(
  p_submission_id UUID,
  p_title TEXT,
  p_slug TEXT,
  p_abstract TEXT,
  p_issue_id UUID,
  p_category_id UUID
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  s public.submissions%ROWTYPE;
  p public.profiles%ROWTYPE;
  main_author TEXT;
  words INT;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can publish submissions' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO s FROM public.submissions WHERE id = p_submission_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Submission not found';
  END IF;
  IF s.status <> 'approved' THEN
    RAISE EXCEPTION 'Only approved submissions can be published (current status: %)', s.status;
  END IF;
  IF COALESCE(trim(p_title), '') = '' OR COALESCE(trim(p_slug), '') = '' THEN
    RAISE EXCEPTION 'Title and slug are required';
  END IF;

  IF s.user_id IS NOT NULL THEN
    SELECT * INTO p FROM public.profiles WHERE id = s.user_id;
  END IF;

  main_author := NULLIF(trim(concat_ws(' ', s.salutation, s.author_name)), '');
  main_author := COALESCE(main_author, p.full_name, s.guest_name);
  words := COALESCE(array_length(regexp_split_to_array(trim(COALESCE(s.content, '')), '\s+'), 1), 0);

  INSERT INTO public.articles
    (title, slug, abstract, content, author_id, authors, affiliation,
     category_id, issue_id, status, published_at, read_time)
  VALUES
    (trim(p_title), trim(p_slug), NULLIF(trim(COALESCE(p_abstract, '')), ''), COALESCE(s.content, ''),
     s.user_id, NULLIF(concat_ws(', ', main_author, NULLIF(trim(s.co_authors), '')), ''), p.institution,
     p_category_id, p_issue_id, 'published', now(), GREATEST(1, ceil(words / 200.0)::int));

  UPDATE public.submissions SET status = 'published' WHERE id = p_submission_id;

  RETURN trim(p_slug);
END;
$$;

REVOKE ALL ON FUNCTION public.promote_submission(UUID, TEXT, TEXT, TEXT, UUID, UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.promote_submission(UUID, TEXT, TEXT, TEXT, UUID, UUID) TO authenticated;

-- 2. Member IDs are assigned by the database on approval (trigger from 20260523010000).
--    The admin page used to compute the next ID in the browser, which could hand out the
--    same ID twice. Make sure the trigger exists and the sequence is past every ID issued.
CREATE SEQUENCE IF NOT EXISTS public.member_id_seq START WITH 1;

CREATE OR REPLACE FUNCTION public.generate_member_id_on_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  new_member_id TEXT;
BEGIN
  IF NEW.status = 'approved' AND COALESCE(NEW.member_id, '') = '' THEN
    new_member_id := 'TAPAM-2026-' || lpad(nextval('public.member_id_seq')::text, 4, '0');
    NEW.member_id := new_member_id;
    IF COALESCE(NEW.notes, '') NOT LIKE '%[MEMBER_ID:%' THEN
      NEW.notes := rtrim('[MEMBER_ID: ' || new_member_id || '] ' || COALESCE(NEW.notes, ''));
    END IF;
  END IF;
  IF NEW.status <> 'approved' THEN
    NEW.member_id := NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_generate_member_id ON public.membership_payments;
CREATE TRIGGER tr_generate_member_id
  BEFORE UPDATE ON public.membership_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_member_id_on_approval();

DO $$
DECLARE
  issued INT;
BEGIN
  SELECT COALESCE(max(substring(member_id FROM '(\d+)$')::int), 0) INTO issued
  FROM public.membership_payments
  WHERE member_id ~ '^TAPAM-\d{4}-\d+$';
  IF issued > 0 AND issued >= (SELECT CASE WHEN is_called THEN last_value ELSE last_value - 1 END FROM public.member_id_seq) THEN
    PERFORM setval('public.member_id_seq', issued, true);
  END IF;
END $$;
