## Add author details to article submission

Extend the public `/submit` form to always collect author identity fields, regardless of sign-in state, and store them with the submission.

### New required fields (top of form, before article fields)
- **Salutation*** — select: Mr. / Ms. / Mrs. / Dr. / Prof.
- **Full Name***
- **Email***
- **Contact number*** — with basic phone validation (10–15 digits, +/spaces allowed)
- **Co-authors names** — optional, free-text (comma separated)

Existing article fields (title, abstract, keywords, category, plan, manuscript, copyright checkbox) stay as-is below.

### Database
Migration on `public.submissions`:
- Add `salutation text`
- Add `author_name text` (required for new rows via trigger/check that allows old rows to remain)
- Add `author_email text`
- Add `contact_number text`
- Add `co_authors text`

Guest fields (`guest_name`, `guest_email`) stay for backward compatibility; new form writes both `author_name`/`author_email` and (for guests) `guest_name`/`guest_email` so existing RLS policy keeps passing.

RLS: extend the existing "Guests create submissions" policy check to require `author_name` and valid `author_email` too (kept simple; still allows anon + authenticated guest-shape inserts).

### Frontend
`src/routes/submit.tsx`:
- Always render the 5 new fields at the top (not gated by sign-in).
- Zod schema updated with the new required fields + regex for phone/email.
- Pre-fill Full Name / Email from the signed-in profile when available; user can edit.
- Insert payload includes all new columns.

### Admin
`src/routes/_authenticated.admin.submissions.tsx`:
- Show salutation + full name as the primary header, email + phone underneath, co-authors as a small line.
- Search matches new fields (name, email, phone, co-authors).
- CSV/export (if present) unchanged aside from new columns.

### Out of scope
- Captcha (still recommended separately).
- Changing plan/payment flow.
- Editing already-submitted rows to backfill author fields.
