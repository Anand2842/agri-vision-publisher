## Goal

Create `TAPAM_Client_Handover.pdf` — a companion to the existing `TAPAM_Client_SOP.pdf` — that gives the client everything they need to own and run the site after handover on 1 July 2026. Same visual style as the SOP (typography, agriculture-green accent, page layout, headers/footers) so the two read as a pair.

## Approach

1. Inspect `/mnt/documents/TAPAM_Client_SOP.pdf` (page size, fonts, color palette, header/footer pattern, heading hierarchy, spacing) and replicate it in ReportLab.
2. Pull live values from the codebase so the document is accurate, not generic:
   - Admin routes under `src/routes/_authenticated.admin.*` (articles, categories, issues, users, memberships, messages, submissions, queue, content, backups)
   - Public routes (home, about, archives, current-issue, articles/$slug, membership, submission-guidelines, etc.)
   - Roles from `user_roles` (admin / moderator / member) and the `has_role` gate
   - Backup system from `src/lib/backup.functions.ts` + `BACKUP_RECOVERY.md` + `/admin/backups`
   - Sitemap, robots, GA4 (`G-HFNDHFLXZP`), Google verification file, GSC steps
3. Generate the PDF with ReportLab, then QA every page as images and fix issues before delivery.

## Document outline

**Cover** — "Client Handover Document", site name, URLs (agriculturemagazine.in, preview, published), "Prepared by Anand · 1 July 2026", version 1.0.

**1. What you're receiving** — Live site, admin panel, Lovable Cloud backend (DB + auth + storage + functions), automated backup project, GA4 + Search Console, GitHub repo (if applicable).

**2. Admin controls & access**
- How to sign in at `/auth`, role model (admin / moderator / member), how to promote a user
- Tour of every admin screen with what it does and when to use it: Articles, Categories, Issues, Memberships, Messages, Queue (moderation), Submissions, Site Content (CMS), Users, Backups
- Certificate pages (article + membership) and how they're auto-generated

**3. Content & ops workflows**
- Publishing an article (draft → review → publish, slug rules, PDF upload to `article-pdfs`, categories/issues)
- Handling submissions from `/submit` and the moderator queue
- Editing homepage / about / footer copy via Site Content
- Managing memberships and payment receipts
- Responding to contact messages
- Sitemap (`/sitemap.xml`) and how Google rediscovers new articles
- GA4 (`G-HFNDHFLXZP`) — where to view traffic, key reports to watch
- Google Search Console — submit only `https://agriculturemagazine.in/sitemap.xml`, request indexing for new articles

**4. Credentials & accounts checklist** (names only, no secret values)
- Lovable workspace (project owner)
- Custom domain registrar (agriculturemagazine.in) — DNS records pointing to Lovable
- Lovable Cloud backend (managed, no separate login required)
- Google Analytics 4 property (`G-HFNDHFLXZP`)
- Google Search Console property (verification file `googlecb6e303629c2e21e.html`)
- Payment provider account (if Razorpay/Stripe is configured)
- Email/SMTP if any transactional email is wired
- Backup secondary project
- Checklist column for "received / pending / N/A" so the client can tick off

**5. Backups & recovery**
- What the backup project mirrors (tables, storage buckets, auth users — see `BACKUP_RECOVERY.md`)
- How the cron runs, how to trigger a manual mirror from `/admin/backups`
- Restore procedure summary + pointer to `BACKUP_RECOVERY.md`

**6. Support & next steps**
- How to request changes (contact channel, expected turnaround)
- Known limitations (e.g. password hashes can't be mirrored; SEO ranking takes weeks)
- Recommended next 30/60/90 days improvements: add more articles, build backlinks, request indexing of key pages, run SEO scan quarterly

**7. Sign-off** — Acknowledgement block with date and signature lines for both parties.

## Style

- Match `TAPAM_Client_SOP.pdf`: same page size, margins, heading font/size hierarchy, agriculture-green accent rule, footer with page number + document title
- Tables for the admin-screen tour and credentials checklist
- No emoji; clean corporate look

## Output

- `/mnt/documents/TAPAM_Client_Handover.pdf`
- Surfaced via `<presentation-artifact>` after QA

## QA

- Render every page to JPG at 150 dpi and visually inspect for overflow, overlap, broken tables, low contrast, leftover placeholder text — fix and re-render until clean.
