## What I found (checked live, not guessed)

1. **The domain is not in your connected Search Console account.** The connected Google account owns only `droneguide.lovable.app`, `www.nabhya.tech` and `sc-domain:nabhya.tech`. `agriculturemagazine.in` is absent — so no sitemap can succeed and no ranking data exists for it in this account.
2. **The homepage emits two `<link rel="canonical">` tags** (`https://agriculturemagazine.in` from the root layout and `https://agriculturemagazine.in/` from the home route). Google treats conflicting canonicals as invalid and may drop the page from indexing.
3. **`/og-default.jpg` returns 404 on the live domain** even though the file exists in the project — the published deployment is behind the current code.
4. **Sitemap `<lastmod>` is generation time**, not real content dates: every static page reports "modified right now" on each fetch. Google discounts sitemaps that do this.
5. Working fine: `/sitemap.xml` returns 200 with 13 static pages + articles, `robots.txt` allows all crawlers, `www` 301s to the root domain.

## Plan

**Step 1 — Link the Search Console connector to this project** so the app/agent can call it with your account.

**Step 2 — Fix the on-page SEO blockers**
- Remove `rel="canonical"` from `src/routes/__root.tsx` (canonical belongs on leaf routes only; every route already sets its own).
- Rewrite `src/routes/sitemap[.]xml.ts`: drop the fake `lastmod` on static routes, keep the real `published_at` value for articles.

**Step 3 — Publish** so the corrected head tags and `og-default.jpg` go live (required before Google can verify the domain).

**Step 4 — Verify `agriculturemagazine.in` in Search Console**
- Request a META verification token via the connector.
- Add the returned `<meta name="google-site-verification">` tag to the root head.
- Publish, confirm the tag is live, then call verify and add the site as a property.

**Step 5 — Submit and check**
- Submit `https://agriculturemagazine.in/sitemap.xml` through the connector.
- Run URL Inspection on the homepage and one article to report actual index status back to you.

## Technical notes

- Verification uses the META method only (Lovable apps can't use DNS/file methods reliably); the token goes in `__root.tsx` head and stays there permanently.
- Ranking itself can't be "fixed" in one step — a brand-new domain has no history. After verification, indexing typically starts within days. This plan removes the blockers (invalid canonical, unverified property, no submitted sitemap) that currently prevent Google from indexing at all.
- No database or business-logic changes.
