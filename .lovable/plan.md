# Client SOP + Delivery Audit Package

Goal: hand the client one professional PDF they can read end-to-end, with screenshots of every screen, a brutally honest "ready / not ready" verdict per feature, and an operating SOP (how to log in, moderate, publish, manage users, handle payments).

## What I'll do

### 1. Live verification pass (browser)
Log into the preview using each seeded account and walk every flow. No assumptions — if a button errors, it gets flagged RED.

Routes to verify, per role:
- **Public**: `/`, `/about`, `/editorial-board`, `/current-issue`, `/archives`, `/articles/:slug`, `/submission-guidelines`, `/publication-ethics`, `/advertise`, `/startup-spotlight`, `/membership`, `/contact`, `/search`, `/auth`
- **Author**: `/dashboard`, `/submit`, membership claim flow, certificate `/membership/certificate/:id`
- **Moderator**: `/admin/queue` (status transitions only)
- **Admin**: `/admin`, `/admin/submissions`, `/admin/articles`, `/admin/issues`, `/admin/categories`, `/admin/content`, `/admin/memberships`, `/admin/messages`, `/admin/users`, `/admin/queue`

For each: screenshot + note (works / partial / broken / missing).

### 2. Brutal readiness matrix
One table per client requirement (from the original DOCX) with verdict:
- GREEN — fully working, client can use today
- AMBER — works but needs manual/offline step (e.g. Razorpay not wired, payment approval is manual)
- RED — missing or broken

Known AMBER/RED going in (will re-confirm live):
- Razorpay live checkout — not wired (no keys)
- Auto-email of accepted PDF to author — not built
- E-ISSN field on About — not added
- Reader role — dead enum value, not granted/used
- `/submit` gating on active membership — needs verification
- Promote submission → published article one-click — needs verification
- Any TypeScript build errors still lingering in certificate routes

### 3. SOP sections (client-facing, plain English)
1. **Accounts & login** — the 3 seeded emails + passwords, how to reset, how to add a new admin/moderator
2. **Author journey** — sign up → buy membership (online Razorpay placeholder / offline UPI screenshot) → get Member ID + certificate → submit article → track status
3. **Moderator journey** — open `/admin/queue`, change status, leave note, audit trail
4. **Admin journey** — managing issues, articles, categories, homepage content, users & roles, messages, memberships, payment approvals
5. **Publishing an article** — from approved submission to live article with PDF
6. **Membership payment handling** — online vs offline flow, where receipts land, how to approve
7. **Content management** — editing About, Editorial Board, Ethics, Advertise, Startup Spotlight via `/admin/content`
8. **Backups & data** — where data lives (Lovable Cloud), how to export
9. **Known limitations** — the AMBER/RED list, what's optional, what needs paid integrations

### 4. Deliverable
A single PDF at `/mnt/documents/TAPAM_Client_SOP.pdf` containing:
- Cover page + executive verdict ("Ready to launch: YES / NO / WITH CAVEATS")
- Readiness matrix
- SOP chapters with embedded screenshots
- Appendix: test credentials, URLs (preview + published), support contacts placeholder

Plus the raw screenshots under `/mnt/documents/sop-screenshots/` so the client can reuse them.

## Technical approach
- Use `browser--navigate_to_sandbox` + `browser--screenshot` to capture each route at 1440×900, logged in as each role sequentially
- Generate PDF via `docx-js` → LibreOffice → PDF (or direct via pdfkit) — TBD, will pick whichever renders embedded images cleanest
- QA pass: render each PDF page to image and inspect before delivery

## What I will NOT do in this pass
- Fix any RED items (separate build task — would expand scope)
- Wire Razorpay (needs client's keys)
- Add email sending (needs domain setup)

If you want any RED item fixed before the SOP ships, say which ones and I'll fold them in first. Otherwise I'll document them honestly and hand over.