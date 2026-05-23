-- Create a sequence for sequential Member IDs starting at 1
CREATE SEQUENCE IF NOT EXISTS public.member_id_seq START WITH 1;

-- Create trigger function to automatically assign member_id on approval
CREATE OR REPLACE FUNCTION public.generate_member_id_on_approval()
RETURNS TRIGGER AS $$
DECLARE
  next_seq INTEGER;
  new_member_id TEXT;
  clean_notes TEXT;
BEGIN
  -- Execute only if status transitions to 'approved' and member_id is currently null
  IF NEW.status = 'approved' AND (NEW.member_id IS NULL OR NEW.member_id = '') THEN
    -- Get next sequence value
    next_seq := nextval('public.member_id_seq');
    new_member_id := 'TAPAM-2026-' || lpad(next_seq::text, 4, '0');
    
    -- Assign to member_id column
    NEW.member_id := new_member_id;
    
    -- Also sync with fallback notes tagging [MEMBER_ID: TAPAM-2026-XXXX] if not already present
    clean_notes := COALESCE(NEW.notes, '');
    IF clean_notes NOT LIKE '%[MEMBER_ID:%' THEN
      NEW.notes := ('[MEMBER_ID: ' || new_member_id || '] ' || clean_notes);
    END IF;
  END IF;
  
  -- Clear member_id if status reverts from approved to pending/rejected
  IF NEW.status != 'approved' THEN
    NEW.member_id := NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Bind the trigger function to the public.membership_payments table
DROP TRIGGER IF EXISTS tr_generate_member_id ON public.membership_payments;
CREATE TRIGGER tr_generate_member_id
  BEFORE UPDATE ON public.membership_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_member_id_on_approval();
