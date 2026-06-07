## Backup Strategy: Nightly Mirror to a Secondary Supabase Project

### Reality check first

Lovable Cloud is a managed Supabase project. We do NOT have superuser access to set up native Postgres logical replication or WAL streaming to an external database. So "always-live hot standby" isn't possible from inside the project. What IS possible and reliable:

**Nightly automated full mirror** — every night, a scheduled job dumps all tables + storage files from the primary (Lovable Cloud) into a second Supabase project that you own directly at supabase.com. If Lovable Cloud ever has an outage or you decide to migrate, you point the app's `SUPABASE_URL` / keys at the backup project and you're running again within minutes, with data at most ~24h old.

You can tighten the schedule (e.g. every 6h or hourly) later if you want a smaller RPO; the mechanism is the same.

### What you need to do once (manual, ~10 min)

1. Create a **free Supabase account** at supabase.com (separate from Lovable).
2. Create a new project there — call it `agriculture-magazine-backup`. Pick the same region (Mumbai/Singapore) for speed.
3. Copy these 3 values from that project's API settings:
   - Project URL (e.g. `https://xxxxx.supabase.co`)
   - `service_role` key (secret — full access)
   - DB password (for emergency direct connection)
4. Paste them into me when prompted; I'll store them as secrets:
   - `BACKUP_SUPABASE_URL`
   - `BACKUP_SUPABASE_SERVICE_ROLE_KEY`

### What I'll build

**1. Schema sync migration helper**
   - A script/server function that reads the current schema (tables, columns, RLS policies, functions, triggers, enums, storage buckets) from the primary and applies it to the backup project. Run once after you connect the backup, and re-run whenever schema changes (or I'll automate it to run before each data sync and skip if identical).

**2. Nightly data mirror — server route at `/api/public/hooks/backup-mirror`**
   - For each table in `public` schema (articles, submissions, profiles, user_roles, membership_payments, categories, issues, site_content, contact_messages, submission_events):
     - Read all rows from primary via `supabaseAdmin`
     - Upsert into backup project via its service role key
     - Chunked in batches of 500 to avoid memory/timeout limits
   - For each storage bucket (`article-pdfs`, `manuscripts`, `site-assets`, `payment-receipts`):
     - List objects, download from primary, upload to backup (skip if same size + mtime to make re-runs cheap)
   - Mirror auth users via Supabase Admin API (`auth.admin.listUsers` → `auth.admin.createUser` with `id` preserved, password hashes can't be exported so users would need a password reset on the backup; member IDs and roles stay intact via `user_roles` table sync)
   - Write a row to a new `backup_runs` table on the primary: `started_at`, `finished_at`, `status`, `tables_synced`, `rows_synced`, `files_synced`, `error`

**3. pg_cron schedule**
   - Run `/api/public/hooks/backup-mirror` every night at 02:00 IST
   - Protected by `apikey` header (Supabase anon key)

**4. Admin UI panel — `/admin/backups`**
   - Shows the last 30 backup runs from `backup_runs` (when, status, rows, files, duration, errors)
   - "Run backup now" button to trigger manually
   - "Test backup connection" button to verify the backup project credentials still work
   - Visible only to `admin` role

**5. Migration runbook**
   - A `BACKUP_RECOVERY.md` doc explaining exactly what to do if you ever need to switch over: rotate `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` to the backup project, redeploy, force password resets, done.

### Honest limitations

- **Auth passwords don't transfer.** Supabase doesn't expose password hashes via API. On a real failover, all users would get a "reset your password" email on first login. Member IDs, roles, profiles, all their content — all preserved.
- **Not zero-RPO.** Up to 24h of data could be lost in a worst-case primary failure right before the next sync. Hourly sync reduces this; true zero-RPO needs WAL replication which Lovable Cloud doesn't expose.
- **Backup project costs.** Supabase free tier covers small projects (500MB DB, 1GB storage). If the magazine grows past that, the backup project would need a paid tier (~$25/mo). I'll add a size-check warning to the admin panel.
- **Schema drift.** If I change the schema in Lovable, the backup needs the same migration. The schema-sync step before each mirror handles this automatically.

### Technical details

- Server functions: `src/lib/backup.functions.ts` (`runBackupMirror`, `testBackupConnection`, `getBackupRuns`)
- Server route: `src/routes/api/public/hooks/backup-mirror.ts`
- Backup client: `src/integrations/supabase/backup-client.server.ts` — second `createClient` instance using `BACKUP_SUPABASE_URL` + `BACKUP_SUPABASE_SERVICE_ROLE_KEY`, loaded only inside `.handler()` via dynamic import to keep it out of the client bundle
- New table: `backup_runs` (RLS: admin/moderator can read; service role writes)
- Cron: scheduled via `pg_cron` + `pg_net` (extensions already available)
- Pagination: `.range(0, 499)` loops to respect Supabase's 1000-row default

### Order of execution

1. Confirm plan, then switch to build mode
2. Ask you to create the backup Supabase project and paste URL + service role key
3. Create `backup_runs` table migration
4. Build server fns + server route + admin UI
5. Run schema-sync once to populate backup project
6. Manually trigger first full mirror via admin UI to verify
7. Enable pg_cron schedule
8. Write `BACKUP_RECOVERY.md`

Confirm and I'll start with step 2 (asking for the backup project credentials).
