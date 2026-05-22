
# Plan: Auth fix + test accounts + client-spec comparison

Three deliverables in one pass: (1) fix the 401 that's breaking the home page, (2) seed admin / moderator / author test logins, (3) hand you a side-by-side of what the magazine PDF asks for vs what's actually built.

---

## 1. Fix the auth / 401 error

**Symptom in the network log:**

```text
GET /rest/v1/articles?status=eq.published…
401  { code: "42501", message: "permission denied for function has_role" }
```

**Root cause.** The `articles` SELECT policy is:

```sql
status = 'published' OR has_role(auth.uid(),'admin') OR has_role(auth.uid(),'moderator')
```

Postgres evaluates the whole OR expression for every caller, including the
anonymous reader on the home page. `public.has_role` is `SECURITY DEFINER`,
but Postgres still requires `EXECUTE` on the function for the calling role.
That grant was never issued to `anon` / `authenticated`, so PostgREST returns
401 before the row even ships. This also silently breaks any public page that
reads `articles` (home featured strip, archives, article detail, search).

**Fix (single migration).**

```sql
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role)
  TO anon, authenticated;
```

Same grant should also be applied to `claim_admin_if_none()` for the
"first user becomes admin" RPC.

**Verification:** re-hit `/rest/v1/articles?status=eq.published` from the
home page and confirm 200 + rows. Also load `/archives` and `/articles/<slug>`
to confirm anonymous reads work end-to-end.

---

## 2. Seed three test accounts

Goal: you can log in as each role without running SQL by hand.

Accounts to create:

| Role      | Email                     | Password         |
| --------- | ------------------------- | ---------------- |
| admin     | `admin@test.lovable.dev`  | `AdminTest!2026` |
| moderator | `mod@test.lovable.dev`    | `ModTest!2026`   |
| author    | `author@test.lovable.dev` | `AuthorTest!2026` |

**How they get created.** A single migration that:

1. Inserts each user into `auth.users` with `email_confirmed_at = now()` so
   they can sign in immediately without the confirmation email step (this is
   only for these three seed rows — does not change global auth settings).
2. Passwords stored via `crypt(<password>, gen_salt('bf'))` (bcrypt) — same
   hash format Supabase Auth uses.
3. Lets the `handle_new_user()` trigger create the `profiles` and default
   `user_roles` rows automatically.
4. Promotes `admin@…` and `mod@…` to their target role by inserting into
   `user_roles` (the trigger leaves them as `author`, we add the second
   role row).

After it runs you can sign in at `/auth` with any of the three.

If you'd rather NOT keep seed users in the DB long-term, we can mark them with a
`is_test_account` flag or just drop the migration later — flag me and I'll
adjust before applying.

---

## 3. Client spec (PDF) vs what's built

This is the comparison you asked for. The PDF is the January-2026 Vol-1
Issue-1 prospectus; below is what it implies the site/backend must support
and where we stand.

### A. Things the PDF asks for and we already have

| PDF requirement                                               | In the build                                                        |
| ------------------------------------------------------------- | ------------------------------------------------------------------- |
| Magazine identity, tagline, ISSN placeholder, chief editor    | `site_content` table + `/about`, `/editorial-board`                 |
| Editorial board: Chief / Associate / Reviewers                | `/editorial-board` route                                            |
| Membership plans (Annual ₹500, Lifetime ₹2000)                | `/membership` route, `membership_plan` enum on `submissions`        |
| Submission workflow (author → review → publish)               | `submissions` + `submission_events` tables, `/submit`, `/dashboard` |
| Private manuscript uploads (.docx)                            | `manuscripts` storage bucket (private, owner+editors)               |
| Published PDF distribution                                    | `article-pdfs` bucket (public), `articles.pdf_url`                  |
| Contact form (Name / Phone / Email / Message)                 | `contact_messages` table + `/contact`                               |
| Publisher / address / phone / email in footer                 | `site_content` "footer" + "contact" sections                        |
| Articles inside the issue (Page 18+: E-learning, MIS, AKIS …) | `articles` + `issues` + `categories` schema                         |
| Reviewer / Associate / Chief Editor roles                     | `app_role` enum: admin / moderator / author / reader                |
| Vision & Mission, About, Readership, Partners on home         | `site_content.home.*` keys                                          |

### B. Things the PDF asks for that are MISSING or PARTIAL

| Gap                                                                | Today                                                              | Needed                                                                                |
| ------------------------------------------------------------------ | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| **Razorpay "Pay Now" for membership** (PDF p.12-13)                | Static membership cards, no checkout                               | Razorpay (or Stripe) integration + payment status on `profiles`/`memberships`         |
| **PhonePe QR / UPI / NEFT bank details display** (PDF p.14-15)     | Not on site                                                        | Add a "Pay offline" panel on `/membership`                                            |
| **Membership certificate + unique membership ID** (PDF p.10)       | Not implemented                                                    | `memberships` table with `member_no`; PDF/image certificate generator                 |
| **Free publication for annual members vs paid for non-members**    | Submission accepts everyone equally                                | Gate `/submit` on active membership; show fee if not a member                         |
| **Peer-review reviewer role with assigned manuscripts**            | `moderator` role exists, no per-reviewer assignment                | `submission_assignments` table + reviewer dashboard                                   |
| **Promote approved submission → published article**                | Status can flip to `approved`, but no copy-into-`articles` action  | Admin button: copy fields, attach PDF, link issue, set `status='published'`           |
| **User/role management UI**                                        | Roles only assignable via raw SQL                                  | `/admin/users` page (server-fn-backed, service role)                                  |
| **Reader-only signup path** (PDF mentions reader subscribers)      | Every signup becomes `author`; `reader` enum value is dead         | Branch in `handle_new_user()` on signup intent, or drop `reader` from enum            |
| **E-ISSN once allocated**                                          | Empty in DB                                                        | Update `site_content.legal.eissn` when number is assigned                             |
| **Plagiarism statement / publication ethics page** (PDF p.11)      | Not on site                                                        | New `/publication-ethics` route                                                       |
| **Advertising info section** (PDF p.17)                            | Not on site                                                        | Section on `/contact` or new `/advertise` route                                       |
| **Auto-email "soft copy to corresponding author"** (PDF p.12)      | Not implemented                                                    | Transactional email on `status → published`                                           |
| **Auth/route hardening**                                           | Component-level `useEffect` redirects, flash-of-protected-content  | Move `/admin`, `/submit`, `/dashboard` under `_authenticated/` + `beforeLoad` guards  |
| **Role badge in header / who-am-I**                                | Not shown                                                          | Chip in `SiteHeader` user menu                                                        |

### C. Things in the build that the PDF does NOT ask for ("extras we put in")

These are not bugs, just scope additions you should know about:

- `site_content` page-driven CMS (admin can edit hero/about/footer copy live).
- `/admin/content` editor and `/admin` dashboard sidebar.
- `submission_events` audit log + filtered audit history view (status / notes
  diff style) on `/admin/queue`.
- Moderator console at `/admin/queue` (built in earlier turns) — wired but not
  in the PDF spec.
- Reusable `app_role` matrix with `admin/moderator/author/reader` (PDF only
  explicitly mentions Chief Editor / Associate Editor / Reviewer / Author).
- `claim_admin_if_none()` bootstrap RPC for first-user onboarding.

---

## What I'll execute, in order

1. **Migration A** — `GRANT EXECUTE` on `has_role` and `claim_admin_if_none`
   to `anon, authenticated`. Verify home page articles fetch returns 200.
2. **Migration B** — Insert three seed `auth.users` rows (admin / moderator /
   author) with bcrypt passwords + auto-confirmed, then upsert the two
   non-default `user_roles`. Verify sign-in works for each.
3. **Hand off the table in section 3** as the canonical gap list so you can
   decide which items to build next (Razorpay, role-manager UI,
   submission→article promotion, route guards, etc.).

No frontend code changes in this pass — only database migrations and the
comparison document. Once you approve, I'll run the two migrations and verify
both the 401 fix and the test logins, then wait for your direction on which
gap-list item to tackle first.
