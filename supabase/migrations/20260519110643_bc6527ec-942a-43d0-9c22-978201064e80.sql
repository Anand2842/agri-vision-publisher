
-- Audit log for submission state changes
CREATE TABLE public.submission_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL,
  actor_id uuid,
  from_status submission_status,
  to_status submission_status,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_submission_events_submission ON public.submission_events(submission_id, created_at DESC);

ALTER TABLE public.submission_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Editors and submitters can view events"
ON public.submission_events FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'moderator'::app_role)
  OR EXISTS (SELECT 1 FROM public.submissions s WHERE s.id = submission_id AND s.user_id = auth.uid())
);

CREATE POLICY "Editors insert events"
ON public.submission_events FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'moderator'::app_role)
);

-- Trigger: auto-log on status or note change
CREATE OR REPLACE FUNCTION public.log_submission_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.submission_events(submission_id, actor_id, from_status, to_status, note)
    VALUES (NEW.id, NEW.user_id, NULL, NEW.status, 'Submission created');
    RETURN NEW;
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status
     OR COALESCE(NEW.notes, '') IS DISTINCT FROM COALESCE(OLD.notes, '') THEN
    INSERT INTO public.submission_events(submission_id, actor_id, from_status, to_status, note)
    VALUES (
      NEW.id,
      auth.uid(),
      OLD.status,
      NEW.status,
      CASE
        WHEN NEW.status IS DISTINCT FROM OLD.status AND COALESCE(NEW.notes,'') IS DISTINCT FROM COALESCE(OLD.notes,'')
          THEN 'Status + notes updated: ' || COALESCE(NEW.notes, '')
        WHEN NEW.status IS DISTINCT FROM OLD.status
          THEN 'Status changed'
        ELSE 'Notes updated: ' || COALESCE(NEW.notes, '')
      END
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_submissions_audit
AFTER INSERT OR UPDATE ON public.submissions
FOR EACH ROW EXECUTE FUNCTION public.log_submission_event();
