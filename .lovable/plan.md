
# SEO & Ranking Plan — agriculturemagazine.in

Goal: get the magazine ranking on Google for agriculture / popular-article / research keywords in India, using the new domain `agriculturemagazine.in` as the canonical home.

I'll split this into **(A) what I do inside the app** and **(B) what you do off-platform** (the parts Lovable can't automate — registrar, Search Console, link building).

---

## A. In-app SEO work (I implement after you approve)

### 1. Domain switch — make `agriculturemagazine.in` canonical
Right now every canonical URL, og:url, sitemap entry, JSON-LD `url`, and robots.txt `Sitemap:` line is hardcoded to `theagriculturepopulararticlemagazine.lovable.app`. I will:
- Add a single `SITE_URL` constant (`https://agriculturemagazine.in`) used everywhere.
- Update `__root.tsx` (Organization + WebSite JSON-LD, og:url).
- Update every route's `canonical` + `og:url` (currently 20+ routes use the lovable.app host or relative paths inconsistently).
- Update `src/routes/sitemap.xml.ts` `BASE_URL`.
- Update `public/robots.txt` `Sitemap:` line.
- Add a 301 redirect from the old `*.lovable.app` host to the new domain (server route) so old links transfer link equity.

### 2. India / Hindi keyword targeting
Default Semrush DB is `us` — wrong market. I will:
- Run Semrush keyword research on the `in` (India) database for seed terms: "agriculture magazine", "krishi magazine", "popular article agriculture", "agriculture research India", "ICAR popular article", "agri startup India", plus category seeds (paddy, soil health, horticulture, dairy, vertical farming).
- Pick 15–20 primary keywords (1 per public route + 1 per top article category) based on volume + KDI fit for a brand-new site (target KDI < 35).
- Rewrite page titles, H1s, meta descriptions, and intro copy on the 12 public routes to lead with those keywords (e.g. `/membership` → "Become a Member — Agriculture Magazine India").
- Add an FAQ block (with `FAQPage` JSON-LD) to `/about`, `/membership`, `/submission-guidelines` — these are the highest-intent commercial pages.

### 3. Structured data depth
Already have Article, Organization, WebSite, PublicationIssue. I will add:
- `BreadcrumbList` on `/articles/$slug`, `/archives`, `/current-issue`.
- `Periodical` schema on `/` and `/about` with ISSN `3107-4521` / E-ISSN `3107-4513` — this is the single biggest signal for Google Scholar inclusion (huge for a research magazine).
- `Person` schema for editorial board members on `/editorial-board`.
- `ScholarlyArticle` (instead of generic `Article`) on `/articles/$slug` — qualifies you for Google Scholar.

### 4. Content & internal linking
- Add a `<nav>` "Browse by topic" block on `/` and `/archives` linking to category-filtered archive views (creates internal link depth Google needs).
- Add author bio pages (`/authors/$slug`) auto-generated from `profiles` — every published article gets an author byline link, multiplying internal links and giving Google an entity to attach to.
- Add "Related articles" cross-links (already partially there — extend to 6 per article, same category).
- Add a `/topics` index page listing every category with article counts.

### 5. Technical / Core Web Vitals
- Add `loading="lazy"` and explicit `width`/`height` on every article cover image (currently mixed).
- Preload the hero image on `/` (LCP win).
- Add `<link rel="alternate" hreflang="en-IN">` and `hreflang="x-default"` on every page.
- Add Open Graph image generation for articles (use the article `cover_url` as og:image — currently we only set the site-wide logo).

### 6. Google Search Console verification
- I'll generate the meta-verification token, embed it in `__root.tsx`, and submit the verification via the Search Console connector. Once verified, I'll submit the sitemap automatically.

---

## B. Off-platform work (you do — I can't automate)

### 1. Domain & DNS
- Buy `agriculturemagazine.in` (any registrar — BigRock / GoDaddy / Namecheap / Cloudflare).
- In Lovable: **Project Settings → Domains → Connect Domain**, add both `agriculturemagazine.in` and `www.agriculturemagazine.in`, set the apex as Primary. Lovable handles SSL.

### 2. Google properties (one-time, free)
- **Google Search Console** — I trigger verification; you click "Verify" in your GSC account.
- **Google Analytics 4** — create a property, paste the Measurement ID in chat, I'll wire it.
- **Google Scholar inclusion** — once ScholarlyArticle schema is live, submit the magazine at scholar.google.com/intl/en/scholar/inclusion.html. This is the single biggest traffic source for research magazines in India.
- **Bing Webmaster Tools** — import from GSC in 1 click.

### 3. Backlink strategy (the part that actually moves rankings)
Google ranks new domains slowly without backlinks. Realistic plan for the first 90 days:

**Tier 1 — free, high-trust, do these in week 1 (target: 15–20 links):**
- ISSN portal listing (issn.org) — you already have ISSNs, list the magazine. Authoritative `.org` link.
- ICAR, IARI, state agricultural university (SAU) library pages — email librarians offering free institutional access. SAUs link freely to open-access agri journals.
- Indian Citation Index, J-Gate, CrossRef (DOI registration ~₹6,000/yr for 100 articles — worth it, adds you to academic indices).
- DOAJ (Directory of Open Access Journals) — free listing once you have 5+ issues; very high authority.
- ResearchGate / Academia.edu publication pages for each editorial board member, linking to article pages.
- Wikipedia: add the magazine to "List of agricultural journals published in India" (must follow notability rules — needs 2 independent secondary sources first).

**Tier 2 — content-driven (target: 1 per week):**
- Guest popular-article on AgriFarming.in, Krishi Jagran, Down To Earth — these accept guest pieces from credentialed authors and give a bio backlink.
- Republish 1 article/month on LinkedIn Articles + Medium with canonical link back (no duplicate-content penalty when canonical is set correctly).

**Tier 3 — directories (do once, walk away):**
ResearchBib, Scilit, OpenAIRE, BASE, Index Copernicus — all free, all relevant for agri research.

I can draft the outreach emails and the LinkedIn/Medium republish posts when you're ready.

### 4. Razorpay + email
Still pending from the prior conversation:
- 4 Razorpay payment-button URLs (paste them in chat, I embed on `/membership`).
- Domain for transactional email (e.g. `editor@agriculturemagazine.in`) so author acceptance emails can send.

---

## Timeline & expectations

- Week 1: domain connected, in-app SEO shipped, GSC + GA4 verified, sitemap submitted.
- Week 2–4: Tier-1 backlinks acquired, Google Scholar submission filed, first 20–30 article pages indexed.
- Month 2–3: rankings begin appearing for low-competition long-tail terms ("popular article on [crop] India", author-name queries, ISSN queries).
- Month 3–6: rankings on mid-tail terms ("agriculture magazine India", category terms) — depends entirely on backlink velocity from Tier 2.

A brand-new domain with no backlinks won't outrank Krishi Jagran or Down To Earth in month 1 — that's a 12-month game. But ScholarlyArticle + ISSN + DOAJ + Google Scholar inclusion can get you indexed and pulling academic traffic within 30 days, which is the realistic short-term win for this niche.

---

## What I need from you before I start building

1. **Confirm**: ship the in-app changes against `https://agriculturemagazine.in` even though the domain isn't connected yet? (Safe — canonical works as soon as DNS resolves; nothing breaks in the meantime.)
2. **Confirm**: OK to rewrite page titles/H1s/descriptions to be keyword-led (e.g. home H1 changes from "The Agriculture Popular Article Magazine" to something like "Agriculture Magazine — Peer-Reviewed Popular Articles & Research, India")? Or keep the current brand-led copy?
3. **Confirm**: register for a CrossRef DOI membership (~₹6,000/yr)? Strong yes for a research magazine, but it's a paid commitment on your side.
4. Optional now, needed later: GA4 Measurement ID, Razorpay button URLs, sender email domain.

Say "go" and I'll start with section A.1 (domain canonicalization) and A.2 (keyword research on the India market) in the same batch.
