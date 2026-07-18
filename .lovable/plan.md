# Audit: Accessibility, UX, Image Sizing — no edits, review only

Reviewed the public site, admin, header/footer, auth, submissions. Verdict: **it ships, but it's rough**. Below is the honest list, grouped by severity. Nothing is fixed yet — approve which buckets you want me to actually address.

---

## CRITICAL — blocks users or breaks WCAG AA

1. `**<main>` landmark is missing on most public pages.** Only `/dashboard` and `/auth` wrap in `<main>`. Home, current-issue, archives, articles, editorial-board, membership, about, faq, contact, advertise, guidelines — none of them do. Screen readers get no "skip to content" target on the entire public site.
2. `**aspect-[16/9]` hero on `/` (index.tsx:106,116) cropping heads on mobile.** On a 375px phone the hero is only ~211px tall; the H1 overlay + subtitle + CTA sit on top of a face-centered photo → text on faces, faces cut. Needs `aspect-[4/5]` mobile → `sm:aspect-[16/9]` OR a two-layer setup (image + dark scrim + text below on mobile).
3. **Images have no explicit `width`/`height`.** Every `<img>` in the codebase is CSS-sized only. Causes CLS (Core Web Vitals hit) and Lighthouse dings. Cover images especially.
4. **Icon-only admin buttons in submissions table (line 386, 404, 446) have no `aria-label`.** Row action toggles/menu triggers are unreachable by name for screen readers.
5. **Color-only status signalling** in admin submissions (Paid/Pending/None badges use color as sole differentiator on some rows — needs an icon or text prefix).
6. `**h-[380px]` scroll wells in `/membership` (line 508)** don't shrink for short viewports; on a 640px-tall laptop the modal content is unreachable.

---

## WARNING — noticeably cheap / degrades trust

7. **Editorial board photos use `aspect-[4/5]` with `object-cover**` — heads getting cropped when portraits aren't shot to that ratio. Should be `object-cover object-top` at minimum, ideally per-member focal point.
8. **Partner logos (`index.tsx:459`)** in a hard `aspect-square` white tile: transparent-PNG logos look fine, but wide horizontal logos shrink to postage stamps because `max-h-full max-w-full` inside a square. Needs `aspect-[3/2]` and taller padding.
9. **Article cover on article page (`articles.$slug.tsx:185`)** uses `object-contain` + `bg-stone-50/50` + padding → letterboxed grey bars around every cover. Modern editorial sites use full-bleed `object-cover` with an artdirected mobile crop.
10. **Archive tile covers (`archives.tsx:187`)** — same `object-contain` + `bg-stone-50/50 p-1` treatment. Looks like a placeholder, not a magazine. Real magazines bleed the cover to the tile edges.
11. **Hero image size on disk is unbounded.** No `<link rel="preload" as="image" imagesrcset>` for the LCP hero, and no responsive `srcset` anywhere. Mobile users download the same 1920px asset as desktop — slow, expensive.
12. **Header search bar** (`SiteHeader.tsx:236`) has `aria-label` but the wrapping magnifier button and the submit both use `aria-label="Search"` — duplicate accessible name in the same landmark.
13. **Mobile nav accordion** — buttons toggle groups but don't set `aria-expanded` / `aria-controls`. Sighted users see the chevron; screen readers get nothing.
14. **Admin sidebar** has no `aria-current="page"` on the active link, and admin pages have no `<main>`.
15. **Focus-visible rings** are inconsistent — many custom `<button className="...">` in admin (submissions, users, memberships) rely on browser default outline which the CSS reset flattens on some elements. Keyboard users lose their place.
16. **Tap targets < 44px** on the pagination dots (`index.tsx:157`) and header icon buttons at `size="icon"` (36×36 shadcn default). Fails WCAG 2.5.5.
17. **Contrast**: `text-foreground/65`, `text-foreground/60` sprinkled across editorial-board (line 194, 225), membership, dashboard. On the cream background this drops below 4.5:1 AA for body text.

---

## INFO — polish

18. Decorative brand mark in footer (`SiteFooter.tsx:62`) uses meaningful `alt` — fine, but the same logo image in the header repeats it. One should be `alt=""` to avoid double-announcement.
19. FAQ page uses `<div>` accordions in some spots — should use `<details>/<summary>` or Radix Accordion for keyboard support.
20. `h-screen` used in a few places (auth, certificate routes) — should be `h-dvh` for mobile URL-bar handling.
21. No `lang` on `<html>` in admin certificate pages (they inherit from `__root.tsx` — verify SSR passes it through).
22. `<img loading="lazy">` used only in editorial-board. Everywhere else eager-loads — hero should be eager, everything below the fold should be lazy.
23. Admin tables (`submissions`, `memberships`, `users`) are `<div>`-based grids, not `<table>`. Screen readers can't announce row/column relationships.
24. Skeletons exist but don't match the real layout height on `/archives` and `/current-issue` — layout still shifts when data arrives.

---

## Image sizing — the standard vs. what we do


| Surface         | Current                                                | Standard (2026 editorial)                                                                         |
| --------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| Home hero       | 1920×1080, single asset, `aspect-16/9` all breakpoints | 1600×2000 mobile + 2400×1350 desktop via `<picture>`; `srcset` w/ 640/1024/1600/2400; preload LCP |
| Article cover   | `aspect-16/9` `object-contain` w/ grey bars            | Full-bleed `object-cover`, `aspect-[4/5]` mobile / `aspect-[16/9]` desktop, ~1600×900             |
| Archive tile    | `aspect-3/4` `object-contain` w/ padding               | Full-bleed `object-cover`, ~600×800, `srcset` 300/600/900                                         |
| Editorial photo | `aspect-4/5` `object-cover`                            | Same, plus `object-top`, 480×600, WebP/AVIF                                                       |
| Partner logo    | `aspect-square` white tile                             | `aspect-3/2`, transparent PNG, 300×200 max, greyscale-on-hover                                    |
| Author avatar   | none / initials                                        | 96×96 WebP square                                                                                 |


Every raster image should be served as **WebP (AVIF where supported)**, capped at **~200KB desktop / ~80KB mobile**, with explicit `width`/`height` attributes to eliminate CLS.

---

## What I recommend approving

Pick any subset — I won't touch anything until you say so:

- **Batch A (critical, 1 pass):** add `<main>` landmark everywhere, mobile hero ratio fix, `aria-label` on admin icon buttons, `aria-expanded` on mobile nav accordion.
- **Batch B (image polish, 1 pass):** switch article/archive covers to `object-cover` full-bleed, per-image `width`/`height`, add `srcset` on hero, lazy-load below-fold images.
- **Batch C (contrast + focus, 1 pass):** raise `/65` `/60` text tokens to solid `text-muted-foreground`, add consistent `focus-visible:ring` to admin buttons, bump tap targets to 44px.
- **Batch D (semantic tables, bigger pass):** convert admin submissions/users/memberships grids to real `<table>` markup.

can you do all 1 by 1 without getting distracted? do it then