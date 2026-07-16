# Plan: Skeleton loaders + submit issue

## Problem 1 — "Cheap" cloud-fetch flash (no skeletons)

Most pages call Supabase inside `useEffect` and render nothing (or a bare "Loading…") until data lands. On slow networks this flashes empty layouts. A `Skeleton` primitive already exists at `src/components/ui/skeleton.tsx` but is barely used outside the sidebar.

**Scope — add branded skeletons to the highest-visibility surfaces:**

1. **Home (`src/routes/index.tsx`)** — hero article card, featured grid tiles, latest list rows.
2. **Current Issue (`src/routes/current-issue.tsx`)** — cover + article list rows.
3. **Archives (`src/routes/archives.tsx`)** — issue tiles grid.
4. **Article page (`src/routes/articles.$slug.tsx`)** — title/eyebrow/meta/body block placeholders.
5. **Search (`src/routes/search.tsx`)** — list row skeletons while `loading` is true (currently just shows small "Searching…" text).
6. **Dashboard (`src/routes/_authenticated.dashboard.tsx`)** — submission row skeletons.
7. **Admin Submissions (`src/routes/_authenticated.admin.submissions.tsx`)** — table row skeletons + StatChip skeletons.
8. **Editorial Board / Startup Spotlight / Membership** — card grid skeletons.

**Approach:**
- Build small local skeleton components per page (e.g. `ArticleCardSkeleton`, `IssueTileSkeleton`, `RowSkeleton`) using `<Skeleton>` primitive tuned to editorial spacing (rule lines, muted `bg-foreground/5`).
- Replace the current "blank until loaded" pattern with skeleton renders. Keep existing data-fetch logic untouched.
- Match the site's editorial tone: thin rules, no shimmer overload, `bg-foreground/6` blocks with the same heights as the real content so layout doesn't shift.

## Problem 2 — "Not able to submit an article"

The console log you pasted shows only third-party **Chrome extension** noise (Grammarly / Explainer/Translate agents, `A listener indicated an asynchronous response…`, unrelated 404). None of it originates from the app code and none of it blocks submission.

Before changing submit code, I need to reproduce the actual failure. Two possibilities:

- **A**: The submit form throws a toast (e.g. "Manuscript upload failed" / "Failed to create submission"). If so, the message text tells us whether it's an RLS policy, a storage bucket permission, or validation.
- **B**: The button spins forever with no toast (network stalled or client crashed).

**Action:** open `/submit` in an incognito window (no extensions) and try one submission. Report the exact on-screen toast text or "nothing happens". I'll then patch the specific failure — likely a storage policy on `manuscripts` bucket or a missing `submissions` insert grant, both fixable in one migration.

## Out of scope
- No changes to submission business logic in this pass (until we confirm the real error).
- No design overhaul — skeletons only.

## Files touched (skeletons pass)
- `src/routes/index.tsx`
- `src/routes/current-issue.tsx`
- `src/routes/archives.tsx`
- `src/routes/articles.$slug.tsx`
- `src/routes/search.tsx`
- `src/routes/_authenticated.dashboard.tsx`
- `src/routes/_authenticated.admin.submissions.tsx`
- `src/routes/editorial-board.tsx`, `src/routes/startup-spotlight.tsx`, `src/routes/membership.tsx`
- new: `src/components/site/Skeletons.tsx` (shared editorial skeleton pieces)
