## Root cause (verified)

The Submit page UI no longer requires membership, but the database RLS policy on `public.submissions` still does. Current INSERT policy `"Users create own submissions"` (verified via `pg_policies`):

```
auth.uid() = user_id
AND status IN ('draft','submitted')
AND (
  EXISTS (SELECT 1 FROM membership_payments mp
          WHERE mp.user_id = auth.uid() AND mp.status = 'approved')
  OR has_role(auth.uid(),'admin')
  OR has_role(auth.uid(),'moderator')
)
```

So any signed-in author without an *approved* membership payment gets an RLS error on submit — matching the user complaint that direct upload doesn't work and users end up emailing manuscripts instead. Admin/moderator accounts are unaffected by this policy, which is why the supervisor's inability to "sign in and upload" points to the same wall (they signed in fine but the upload failed silently / with a permission error), unless the supervisor's account simply isn't marked admin yet.

## Fix

1. **Migration** — drop the payment-gated INSERT policy and replace it with a simple "authenticated user can insert own submission" policy:
  ```sql
   DROP POLICY "Users create own submissions" ON public.submissions;
   CREATE POLICY "Users create own submissions"
     ON public.submissions FOR INSERT TO authenticated
     WITH CHECK (
       auth.uid() = user_id
       AND status IN ('draft','submitted')
     );
  ```
   Membership/payment status stays visible to admins in the submissions dashboard (already implemented) so they can see who paid vs. who hasn't — the gate just moves from "hard block" to "admin visibility".
2. **Verify supervisor account** — I need one thing from you: **which email is the supervisor?** I'll confirm the account exists and has the `admin` role (grant it if missing). If it's `stufi339@gmail.com AND` [dkdkdangi@gmail.com](mailto:dkdkdangi@gmail.com) , BOTH ARE ADMIN HERE. 
3. **Smoke test** — after the migration, drive a Playwright submit as a plain author account to confirm the insert + manuscript upload both succeed end-to-end, and check the row lands in `/admin/submissions` with the correct Membership badge.

## Not changing

- Submit UI, admin submissions dashboard, storage policies (manuscript upload path already works for any signed-in user under their own `auth.uid()` folder).
- Membership payment flow — still available, just no longer blocking submission.

## One question before I build

Which email should I make sure has the admin role for the supervisor? (If it's already `stufi339@gmail.com AND` [dkdkdangi@gmail.com](mailto:dkdkdangi@gmail.com) , say so and I'll skip that step.)

AND CHECK EVRYTHING WITH IT

&nbsp;