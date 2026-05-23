-- Add member_id column to public.membership_payments
ALTER TABLE public.membership_payments ADD COLUMN IF NOT EXISTS member_id TEXT UNIQUE;
