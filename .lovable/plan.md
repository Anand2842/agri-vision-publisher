# Backend Architecture & Role System — Planned vs Executed

This is an architecture briefing, not a code change. It compares what the
brand/process documents implied the platform _should_ do against what is
actually wired in the database, RLS policies, and UI today, and ends with the
specific gaps to close next.

---

## 1. Identity & roles — the four-tier model

The role enum already in the database:

```text
app_role = { admin · moderator · author · reader }
```

| Role        | Who it represents                                            | How it's assigned today                                                                                          |
| ----------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| `admin`     | Chief Editor (Dr. Dileep Kumar) + delegated managing editors | First signed-in user clicks "Claim admin" → `claim_admin_if_none()`; further admins must be promoted from the DB |
| `moderator` | Associate Editors & section editors who triage submissions   | **Not assignable from the UI yet** — must be inserted directly into `user_roles`                                 |
| `author`    | Any member who submits articles                              | Auto-assigned on signup via the `handle_new_user()` trigger                                                      |
| `reader`    | Members who only read / download                             | **Defined in the enum but never granted** — every signup currently becomes an `author`                           |

Roles live in a **separate `user_roles` table** (correct — prevents privilege
escalation). Lookups go through the security-definer function
`has_role(user_id, role)` which is what every RLS policy calls.

---

## 2. Permission matrix — planned vs executed

Legend: ✓ wired · ◐ partial · ✗ missing

| Capability                                    | reader | author | moderator | admin | Status                                                   |
| --------------------------------------------- | :----: | :----: | :-------: | :---: | -------------------------------------------------------- |
| Read published articles & issues              |   ✓    |   ✓    |     ✓     |   ✓   | ✓ public SELECT policy                                   |
| Read own profile / update own profile         |   ✓    |   ✓    |     ✓     |   ✓   | ✓                                                        |
| Submit a manuscript (.docx upload)            |   ✗    |   ✓    |     ✓     |   ✓   | ✓ via `submissions` INSERT policy + `manuscripts` bucket |
| View own submissions in dashboard             |   —    |   ✓    |     ✓     |   ✓   | ✓                                                        |
| Triage submissions (change status, add notes) |   —    |   —    |     ✓     |   ✓   | ✓ RLS allows both; **no moderator UI exists**            |
| Download any submitter's manuscript           |   —    |   —    |     ✓     |   ✓   | ✓ storage RLS                                            |
| Publish article from approved submission      |   —    |   —    |     ◐     |   ✓   | ✗ no "promote submission → article" action yet           |
| CRUD issues / articles / categories           |   —    |   —    |     ✗     |   ✓   | ✓ admin-only RLS; admin UI exists                        |
| Read contact form messages                    |   —    |   —    |     ✗     |   ✓   | ✓ admin-only                                             |
| Manage user roles (promote / demote)          |   —    |   —    |     —     |   ✓   | ✗ **no users page in admin**                             |
| Bootstrap first admin                         |   —    |   —    |     —     | self  | ✓ `claim_admin_if_none()` RPC                            |

The gap pattern is consistent: **policies are in place, the UI to use them is
not**. Moderators have permission in Postgres but no screen, and admins can't
manage roles or promote approved submissions into the public site.

---

## 3. How a request flows today

```text
Browser (TanStack route)
  └─ supabase-js (publishable key + user JWT)
       └─ PostgREST
            └─ RLS policy fires has_role(auth.uid(), 'admin'|'moderator')
                 └─ row returned / write allowed / 401-ish error
```

Three Supabase clients exist; the project uses only the first:

- `@/integrations/supabase/client` — browser, RLS-bound · **used everywhere**
- `@/integrations/supabase/auth-middleware` — server-fn, acts as user · unused
- `@/integrations/supabase/client.server` — service-role admin · unused

That's why everything works through RLS — there's no server-side bypass code
anywhere in the app today.

---

## 4. Route → role map (what gates each page)

| Route                                                                                                                                    | Gate today                         | Should be                              |
| ---------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | -------------------------------------- |
| `/`, `/about`, `/archives`, `/articles/:slug`, `/current-issue`, `/editorial-board`, `/submission-guidelines`, `/contact`, `/membership` | Public                             | Public ✓                               |
| `/auth`                                                                                                                                  | Public                             | Public ✓                               |
| `/submit`                                                                                                                                | Component check: signed-in         | Should also require `author` or higher |
| `/dashboard`                                                                                                                             | Component check: signed-in         | OK; should show role badge             |
| `/admin/*`                                                                                                                               | Component check: `has_role(admin)` | OK, but no `moderator` console exists  |

All gating is currently **component-level** (`useEffect` + redirect). The
TanStack-native pattern is a pathless `_authenticated/` layout with
`beforeLoad` + `redirect()` — that's the recommended next refactor for both
safety (no flash of protected UI) and code clarity.

---

## 5. Storage & the manuscript pipeline

```text
author /submit form
  → INSERT into submissions  (RLS: user_id = auth.uid())
  → upload to manuscripts/<user_id>/<submission_id>.docx
       (RLS: owner OR admin/moderator can read; only owner can write)
  → UPDATE submissions.manuscript_path
```

Buckets:

- `manuscripts` — private, owner + editors only ✓
- `article-pdfs` — public, for published-issue PDFs ✓

---

## 6. What's missing — concrete build items

Ordered by impact:

1. **Moderator console** at `/admin/queue` (or a `moderator` flag on the
   admin sidebar). Same submissions list as admin, but scoped to status
   transitions only — no issues/categories/articles CRUD.
2. **User & role manager** at `/admin/users` — list profiles, attach a role
   chip, promote/demote (admin-only). Today the only way to make someone a
   moderator is a raw SQL insert.
3. **"Promote submission → article"** action on the admin submissions row:
   on `approved`, copy title/abstract/content into `articles`, attach
   manuscript PDF, set `status = published`, link to current issue.
4. **Route-level guards** — move `useEffect` redirects in `/admin`, `/submit`,
   `/dashboard` into `_authenticated/` and `_authenticated/_admin/` pathless
   layouts using `beforeLoad`.
5. **Reader plan** — either grant `reader` on signup for non-author members,
   or drop it from the enum. Right now it's dead weight.
6. **Role badge** in `SiteHeader` user menu so a signed-in user can see
   whether they're author / moderator / admin.

---

## Technical notes (for implementation later)

- `handle_new_user()` always assigns `author`; to support a `reader` flow,
  branch on `raw_user_meta_data->>'intent'` set at signup.
- Promotion to admin/moderator should go through a server function using
  `supabaseAdmin` (service role) guarded by `requireSupabaseAuth` +
  `has_role(uid, 'admin')`, because changing your _own_ role via the browser
  client is blocked by RLS (correct — but means we need a server fn).
- The "promote submission → article" flow is also best as a server function:
  it's a transactional multi-table write and benefits from running as admin
  rather than relying on the user's RLS context.
- Audit trail is currently absent. If editorial accountability matters, add
  a `submission_events` table written on every status change.

This document is for understanding only — no files will change until you pick
which gaps to close next.
