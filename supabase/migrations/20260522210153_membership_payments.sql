-- Create public membership_payments table
CREATE TABLE IF NOT EXISTS public.membership_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan public.membership_plan NOT NULL,
  amount NUMERIC NOT NULL,
  transaction_ref TEXT NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('upi', 'bank')),
  receipt_path TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.membership_payments ENABLE ROW LEVEL SECURITY;

-- Select policy: users can view their own payment claims, admins/moderators can view all
CREATE POLICY "Users view own payments" ON public.membership_payments
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

-- Insert policy: users can submit their own payment claims
CREATE POLICY "Users insert own payments" ON public.membership_payments
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Update/All policy: admins and moderators can update/delete payment claims
CREATE POLICY "Staff manage payments" ON public.membership_payments
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

-- Create storage bucket for receipt screenshots
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', true)
ON CONFLICT (id) DO NOTHING;

-- Policy for viewing receipts
CREATE POLICY "Public receipts read" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'receipts');

-- Policy for uploading receipts (authenticated users upload into their own folder)
CREATE POLICY "Authenticated receipts upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'receipts'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
