CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$ BEGIN
  CREATE TYPE public.payment_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.membership_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  plan public.membership_plan NOT NULL,
  amount numeric(10,2) NOT NULL,
  transaction_ref text NOT NULL,
  payment_method text NOT NULL,
  receipt_path text,
  status public.payment_status NOT NULL DEFAULT 'pending',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mp_user ON public.membership_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_mp_status ON public.membership_payments(status);

ALTER TABLE public.membership_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users create own payments"
  ON public.membership_payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users view own payments"
  ON public.membership_payments FOR SELECT
  USING (auth.uid() = user_id
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'moderator'::public.app_role));

CREATE POLICY "Editors update payments"
  ON public.membership_payments FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'moderator'::public.app_role));

CREATE TRIGGER mp_set_updated_at
  BEFORE UPDATE ON public.membership_payments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO storage.buckets (id, name, public) VALUES ('payment-receipts', 'payment-receipts', false)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users upload own receipts"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'payment-receipts'
    AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users view own receipts"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'payment-receipts'
    AND (auth.uid()::text = (storage.foldername(name))[1]
      OR public.has_role(auth.uid(), 'admin'::public.app_role)
      OR public.has_role(auth.uid(), 'moderator'::public.app_role)));
