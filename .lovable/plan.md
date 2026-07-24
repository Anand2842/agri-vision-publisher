## What I found

### 1. Submit RLS error — root cause (verified)

The failed request in your network log went out with `user_id: null` + guest fields, but the Authorization header carried a signed-in admin bearer (dkdkdangi@gmail.com). PostgREST evaluated it as role `authenticated`, not `anon`, so the "Guests create submissions" policy (which is `TO anon` only) never applied — and the "Users create own submissions" policy failed because `auth.uid() ≠ null`.

Why the form sent `user_id: null` while signed in: `Submit()` calls `supabase.auth.getUser()` once on mount. If the session had expired / not rehydrated at that moment, `isGuest` became `true` and the form submitted as a guest — but the Supabase client still attached the bearer token to the request.

### 2. Smart header

`SiteHeader` is a plain sticky header. No scroll listener, no hide-on-scroll-down / show-on-scroll-up behavior.

### 3. "Audit everything"

Too broad for one plan. I'll fix the two concrete items now and, in the same pass, run a quick sweep for the closely related risk (guest submit path end-to-end + header behavior on mobile). A full site-wide audit (perf, a11y, SEO, admin flows, RLS, storage) is a separate, bigger effort — happy to schedule it as its own plan after this ships.

---

## Fix plan

### A. Submit — make the guest/auth split reliable

1. **Policy safety net** (migration): recreate `Guests create submissions` with `TO anon, authenticated` so a signed-in user submitting a `user_id IS NULL` row is still allowed (guest-shaped rows are safe regardless of role). Keep the existing authenticated own-row policy untouched.
2. **Client**: in `src/routes/submit.tsx`
   - Re-check the session at submit time (not just on mount) via `supabase.auth.getUser()` inside `onSubmit`, and derive `isGuest` from that fresh value.
   - When signed in, always set `user_id = <fresh uid>` and never send guest fields.
   - Subscribe to `onAuthStateChange` so `isGuest` flips live if the user signs in/out while the page is open.
   - Small UX: if signed in, hide the guest name/email block (already conditional — verify it stays hidden after the live check).
3. **Verify**: submit twice against localhost — once signed out (guest row lands, manuscript uploads under `guest/`), once signed in as an author (row has `user_id`, manuscript under `<uid>/`). Confirm both appear in `/admin/submissions` with correct badges.

### B. Smart header

In `src/components/site/SiteHeader.tsx`:
- Track `window.scrollY` with a throttled listener (rAF).
- Hide the header (translate-y-full) when scrolling down past ~80px, show it when scrolling up, always show at top.
- Add a subtle shadow/border once `scrollY > 0`.
- Keep mobile menu behavior unchanged; ensure the hide doesn't apply while the mobile menu is open.
- Respect `prefers-reduced-motion` (skip the transition).

### C. Light sweep (bundled with the above, not a full audit)
- Confirm `Submit` link in header + footer points to `/submit` (public).
- Confirm `/submit` head/meta + canonical are correct.
- Confirm `manuscripts` storage policies still allow `guest/` uploads (already migrated).

## Not changing
- Admin submissions dashboard layout, membership flow, storage bucket structure, existing RLS on other tables.
- No captcha in this pass (call it out again as a follow-up before public launch).

## One question
Do you want the smart header on **all pages** (including admin), or **public pages only** (leave admin header static so scrolling long tables doesn't hide nav)? Default I'll ship: **public pages only**.
