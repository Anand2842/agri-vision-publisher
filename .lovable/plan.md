## Root cause

Google can't fetch `/sitemap.xml` — it returns **404**. The file is `src/routes/sitemap.xml.ts` with `createFileRoute("/sitemap/xml")`, so in TanStack Router the dots in the filename become slashes and the route actually serves at `/sitemap/xml` (also 404 because the generated route ID doesn't match either). To serve a literal `/sitemap.xml`, the dot must be escaped with `[.]` in the filename.

`robots.txt` advertises `https://agriculturemagazine.in/sitemap.xml`, so every sitemap Google tried (`/sitemap.xml.ts`, `/sitemap`, `/sitemap.xml`) 404s. That alone blocks crawl/indexing of article pages.

## Fixes

1. **Make the sitemap resolve at `/sitemap.xml`**
   - Rename `src/routes/sitemap.xml.ts` → `src/routes/sitemap[.]xml.ts`
   - Update the route to `createFileRoute("/sitemap.xml")`
   - Keep the existing loader logic (static routes + published articles from DB)
   - Verify with `curl -I https://agriculturemagazine.in/sitemap.xml` → expect `200` + `Content-Type: application/xml`

2. **Resubmit in Google Search Console**
   - Remove the three broken entries (`/sitemap.xml.ts`, `/sitemap`, `/sitemap.xml`)
   - Submit only `https://agriculturemagazine.in/sitemap.xml`

3. **Ranking / indexability improvements** (addressing "not ranking good")
   - Add `<lastmod>` to all static entries in the sitemap (currently only article URLs have it) — helps Google prioritize recrawls
   - Confirm canonical + `og:url` on article pages self-reference (per project rules); spot-check `src/routes/articles.$slug.tsx`
   - Run the SEO scanner (`seo_chat--trigger_scan`) to surface missing titles/descriptions/H1s across routes
   - Verify Google site verification file (`googlecb6e303629c2e21e.html`) is reachable and that the property is verified in GSC
   - After redeploy, use GSC "URL Inspection" → "Request indexing" on the homepage and 3–5 top articles to speed up recrawl

## Note

Ranking improvements from a sitemap fix typically take days to weeks — the immediate win is Google being able to fetch the sitemap and discover article URLs. Deeper ranking work (content/keywords/backlinks) is a separate follow-up I can scope with Semrush data if you want.