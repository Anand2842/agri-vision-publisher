# Focused Cleanup Pass — Data Wiring, Nav, Brand

One pass that makes the public site honest: real DB data flowing end‑to‑end, no dead nav links, one brand name, one ISSN.

---

## 1. Database — add the missing foreign keys

Today `articles`, `issues`, and `submissions` have **zero foreign keys**, so PostgREST embedded selects (`categories(name)`, `profiles(full_name,…)`) return HTTP 400 and the site silently falls back to mock data.

Migration adds:

- `articles.author_id → profiles.id` (on delete set null)
- `articles.category_id → categories.id` (on delete set null)
- `articles.issue_id → issues.id` (on delete set null)
- `submissions.user_id → profiles.id` (on delete cascade)
- `submissions.category_id → categories.id` (on delete set null)

No data changes, no RLS changes — just constraints so PostgREST can resolve the joins already in `src/lib/data.ts`.

## 2. Wire the remaining pages to live data

`src/lib/data.ts` is the live source of truth. Three pages still import `@/lib/mock-data` directly:

- `src/routes/index.tsx` → use `fetchPublishedArticles(limit)` for the article rails; keep `stats` as a static block (it's marketing copy, not data).
- `src/routes/editorial-board.tsx` → keep mock for now (no `editorial_board` table exists yet — out of scope for this pass; note in comments).
- `src/routes/startup-spotlight.tsx` → keep mock for now (no table) — but **remove the orphan from nowhere‑linked status by either (a) leaving it unlinked or (b) noted as future work**. Out of scope for this pass.

After step 1's FKs land, the existing query syntax will start returning rows.

## 3. Header navigation cleanup

Edit `src/components/site/SiteHeader.tsx`:

- Remove fake nav entries: drop **"Advertise" → /contact**, **"Events" → /about**, **"Volume (05) Issue (07), Feb 2026"** hardcoded label.
- Replace Archives dropdown's fake Volume 1–5 children with a single "Browse Archives" link to `/archives` (real per‑issue pages are a separate effort).
- Replace Publication dropdown's duplicated children with one entry: "Author Guidelines" → `/submission-guidelines`, "Submit Article" → `/submit`, "Membership & Fees" → `/membership`. Drop "Payment".
- Social icons (`href="#"` × 4): remove from header until real URLs exist. Cleaner than dead links.

## 4. Brand name + ISSN unification

Pick **one** canonical name. Recommendation: **"Agripop"** (shorter, already used in 8 of 12 head titles, matches the project tone).

- Sweep `src/routes/*.tsx`, `src/components/site/SiteFooter.tsx`, `src/components/site/SiteHeader.tsx`: replace every "The Agriculture Magazine" / "The Agriculture Popular Article Magazine" mention in titles, headings, footer brand, citation strings, og:title with **"Agripop"** (tagline "Peer‑Reviewed Open Access Monthly" stays).
- Footer brand → "Agripop".
- ISSN: footer says `2980-2222`, current‑issue page says `2583-XXXX` (a placeholder). Until a real ISSN exists, **remove the ISSN line entirely** from both surfaces. Better to show nothing than fake data.

## Out of scope (deliberately)

- Per‑issue route (`/issues/$id`)
- Author file uploads on `/submit`
- Stripe / payment on `/membership`
- Google OAuth + password reset on `/auth`
- Privacy / Terms / Advertise / Events pages
- `editorial_board` and `startups` tables
- Toast feedback for clipboard buttons
- Tightening the `profiles` public‑read RLS policy

These are real, but each is its own focused pass. Lumping them in here turns one clean PR into a sprawl.

---

## Technical notes

**Migration SQL shape:**
```sql
ALTER TABLE public.articles
  ADD CONSTRAINT articles_author_id_fkey
    FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD CONSTRAINT articles_category_id_fkey
    FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL,
  ADD CONSTRAINT articles_issue_id_fkey
    FOREIGN KEY (issue_id) REFERENCES public.issues(id) ON DELETE SET NULL;

ALTER TABLE public.submissions
  ADD CONSTRAINT submissions_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  ADD CONSTRAINT submissions_category_id_fkey
    FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_articles_author_id   ON public.articles(author_id);
CREATE INDEX IF NOT EXISTS idx_articles_category_id ON public.articles(category_id);
CREATE INDEX IF NOT EXISTS idx_articles_issue_id    ON public.articles(issue_id);
CREATE INDEX IF NOT EXISTS idx_submissions_user_id  ON public.submissions(user_id);
```

**Files touched:**
- `supabase/migrations/<new>.sql` — FKs + indexes
- `src/routes/index.tsx` — fetchPublishedArticles wiring
- `src/components/site/SiteHeader.tsx` — nav + social cleanup, brand
- `src/components/site/SiteFooter.tsx` — brand + ISSN removal
- `src/routes/__root.tsx`, `auth.tsx`, `about.tsx`, `submit.tsx`, `submission-guidelines.tsx`, `membership.tsx`, `dashboard.tsx`, `search.tsx`, `archives.tsx`, `contact.tsx`, `current-issue.tsx`, `articles.$slug.tsx`, `index.tsx` — brand + ISSN sweep

**Verification after build:**
- Open `/` → network tab shows the `/rest/v1/articles?...` call returning **200** with rows (or empty array, not 400).
- Header shows: Home / Editorial Board / Current Issue / Archives / Submission / Publication / About / Contact. No "Advertise", "Events", or hardcoded volume label.
- Footer + every `<title>` says "Agripop". No "2980‑2222" or "2583‑XXXX" anywhere.
