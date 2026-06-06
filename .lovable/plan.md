## Security Fixes Plan

Address 7 security findings with a mix of DB migrations, RLS hardening, code changes, and HTML sanitization.

### 1. Submission status RLS (error)
Drop the existing "Users update own draft" policy on `public.submissions` and replace with a `WITH CHECK` that:
- Restricts `auth.uid() = user_id`
- Only allows status values `'draft'` or `'submitted'` (no self-publishing)
- Only allows updates when current row status is `'draft'` or `'revision_requested'`

Admin/moderator update policy stays as-is for editorial workflow.

### 2. Mock certificate route (error)
In `src/routes/article.certificate.$submissionId.tsx`:
- Remove the `mock-` / short-ID short-circuit that renders a hardcoded "Dr. Anand Kumar" published certificate
- Always query the DB
- Require authentication: move route into `_authenticated/` OR add auth check + ownership verification (user is submission owner, or admin/moderator)
- Only render certificate when `status === 'published'`

### 3. Membership gate server-side enforcement (warn)
Add `WITH CHECK` to the submissions INSERT policy:
```
auth.uid() = user_id AND (
  EXISTS (SELECT 1 FROM membership_payments WHERE user_id = auth.uid() AND status = 'approved')
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'moderator')
)
```
Keep client-side UI gate for UX.

### 4. HTML XSS sanitization (warn)
- Install `dompurify` + `@types/dompurify` (or `isomorphic-dompurify` for SSR safety)
- Wrap every `dangerouslySetInnerHTML` with `DOMPurify.sanitize(...)`:
  - `src/routes/articles.$slug.tsx` (article body)
  - `src/routes/publication-ethics.tsx` (2 spots)
  - Any other `dangerouslySetInnerHTML` discovered during implementation
- For JSON-LD `<script>` blocks (articles, archives, root): escape `</script>` in stringified JSON before injecting

### 5. Manuscripts bucket — add UPDATE policy (warn)
Add storage policy on `storage.objects` for `bucket_id = 'manuscripts'`:
- Authors can UPDATE files in their own folder (path prefix `auth.uid()/...`)
- Admin/moderator can UPDATE any

Mirror the existing INSERT policy logic.

### 6. Payment receipts bucket — admin UPDATE/DELETE (warn)
Add storage policies on `storage.objects` for `bucket_id = 'payment-receipts'`:
- Admin and moderator can UPDATE
- Admin and moderator can DELETE

### 7. user_roles anonymous policies (warn)
Recreate the two policies with explicit `TO authenticated`:
- "Users can view own roles" — `TO authenticated USING (auth.uid() = user_id)`
- "Admins manage roles" — `TO authenticated USING (has_role(auth.uid(),'admin'))`

This removes the `anon` role from the policy roles list.

### Implementation order
1. One Supabase migration covering items 1, 3, 5, 6, 7 (RLS + storage policies)
2. Install DOMPurify
3. Code edits for items 2 and 4
4. Re-run security scan and mark findings fixed

### Not in scope (separate findings, already flagged elsewhere)
- `payment_status_localstorage` — covered in earlier offline-sync work
- `site_content_public_phone_email` — needs product decision (move contact info to a server-fetched endpoint or restrict table)
- SUPA SECURITY DEFINER executable / search_path warnings — pre-existing Supabase advisories on helper functions; can be addressed in a follow-up

Confirm and I'll switch to build mode and execute.
