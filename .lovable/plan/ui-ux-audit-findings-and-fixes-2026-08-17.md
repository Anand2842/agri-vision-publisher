# UI/UX audit — findings and fixes

Audited home, current issue, archives, submit, membership, about, FAQ and contact at desktop (1280) and mobile (390) with real screenshots. No layout overflow, no missing alt text, one H1 per page — the structure is solid. The problems below are visual/usability, not structural.

## 1. Hero posters get cropped on mobile (worst issue)

The hero slides are poster-style images with text baked in. The slider forces a 4:5 box on mobile and uses `object-cover`, so on a 390px screen the left third of the poster is cut off — the headline reads "…culture … rticle Magazine" and the CTA buttons are sliced in half.

Fix: keep the poster's native 16:9 ratio at every breakpoint and let the image fit inside the frame (contain) on small screens, with the deep-green brand colour filling any letterbox space. Nothing gets cut.

## 2. Duplicate headline over the hero

A white overlay headline plus tagline sits on top of posters that already print the magazine name — on mobile the two overlap and both become hard to read.

Fix: keep the H1 in the markup for SEO but hide it visually when the slide already carries brand text; keep the tagline only on desktop where there is clear space.

## 3. Header eats the first screen on mobile

The ISSN strip wraps to three lines, then a phone bar, then the logo bar — roughly 200px of chrome before any content. Also the mobile header shows only "Current Issue" + hamburger; there is no visible Sign in / Submit action.

Fix: condense the ISSN strip to one line (truncate on small screens), reduce its vertical padding, and add a compact Submit action next to the hamburger.

## 4. Current issue page: dead left column

Below the cover, the left column ends with "Issue PDF coming soon" in low-contrast grey that looks like a broken link, followed by a large empty area next to a long article list.

Fix: render the unavailable-PDF line as an explicit muted note (not link-styled), and make the left column sticky so it stays beside the article list instead of leaving whitespace.

## 5. Small tap targets

13–25 links/buttons per page measure under 32px on mobile (footer links, inline text links, table row actions in admin). Apple/Google guidance is 44px.

Fix: raise the minimum touch target for footer and utility links and admin row actions to 44px via padding, without changing visual density on desktop.

## 6. Minor

- Two images (current issue cover, membership badge) render without intrinsic width/height, so they cause a small layout shift. Add dimensions.
- One 404 resource request fires on every page load; trace and remove the dead reference.

## Technical notes

- `src/routes/index.tsx` — hero section: replace `aspect-[4/5] sm:aspect-[16/9]` with `aspect-[16/9]`, switch `object-cover` to `object-contain sm:object-cover`, `sr-only sm:not-sr-only` on the overlay H1.
- `src/components/site/SiteHeader.tsx` — ISSN strip single line + truncate, tighter padding, mobile submit button.
- `src/routes/current-issue.tsx` — sticky left column, muted PDF note, image dimensions.
- `src/components/site/SiteFooter.tsx` and admin tables — min-height 44px on interactive elements.

No backend, schema or business-logic changes.
