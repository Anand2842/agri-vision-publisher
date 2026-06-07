# Backup & Disaster Recovery Runbook

## What's in place

A scheduled job runs every night at **02:00 IST** (`30 20 * * *` UTC) that mirrors:

- All `public` schema tables (articles, submissions, profiles, user_roles, membership_payments, categories, issues, site_content, contact_messages, submission_events) — full upsert
- All storage buckets (`article-pdfs`, `manuscripts`, `site-assets`, `payment-receipts`) — file-level copy with overwrite
- All auth users (id, email, phone, metadata — passwords are NOT exportable)

→ into the secondary Supabase project configured via the secrets `BACKUP_SUPABASE_URL` and `BACKUP_SUPABASE_SERVICE_ROLE_KEY`.

Run history and the **Run backup now** / **Test connection** buttons live at `/admin/backups`.

## RPO / RTO

- **RPO** (data loss window): up to **24 hours** with the default nightly schedule. Tighten by editing the cron expression.
- **RTO** (recovery time): ~15 minutes once you decide to fail over (see below).

## One-time bootstrap of the secondary project

Before the first mirror run, the backup project's database needs the same schema. Do this once:

1. Open the secondary project's **SQL Editor** at supabase.com.
2. Open every file in `supabase/migrations/` (in this repo) in chronological order and paste each into the SQL editor and run it. Do NOT include `20260607*backup_runs*.sql` (that table only lives on the primary). Stop if any migration fails — investigate before continuing.
3. Confirm the storage buckets are listed under **Storage** (the mirror creates them automatically on first run if missing, but `manuscripts` and `payment-receipts` must remain private).
4. Back in the app, go to `/admin/backups` → **Test connection** → expect ✅ → **Run backup now**.

## Failing over to the backup (real disaster)

If Lovable Cloud is down or you decide to migrate permanently:

1. **Confirm the backup is fresh.** Log in to supabase.com → the backup project → check the latest rows in `articles` / `submissions` against what you remember.
2. **Get the backup project's API keys** (Project Settings → API):
   - Project URL → becomes the new `VITE_SUPABASE_URL` and `SUPABASE_URL`
   - `anon` key → becomes the new `VITE_SUPABASE_PUBLISHABLE_KEY` and `SUPABASE_PUBLISHABLE_KEY`
   - `service_role` key → becomes the new `SUPABASE_SERVICE_ROLE_KEY`
3. **In Lovable**, open Cloud → disable Lovable Cloud OR override the env vars by replacing them via Project Secrets / `.env` overrides. (If Lovable Cloud is the outage, host the app on Vercel/Netlify with the new env vars instead.)
4. **Redeploy / republish** the app.
5. **Notify users** that they must reset their password on first login (we cannot transfer password hashes). Send a broadcast email pointing them to "Forgot password" on `/auth`. Profiles, roles, membership IDs, articles, all uploads are preserved.
6. **Set up a NEW backup project** for the new primary, repeat the bootstrap, point the secrets at it.

## Tightening the schedule

In the Supabase SQL editor of the **primary** project:

```sql
SELECT cron.unschedule('backup-mirror-nightly');

SELECT cron.schedule(
  'backup-mirror-6h',
  '0 */6 * * *',  -- every 6 hours
  $$
  SELECT net.http_post(
    url := 'https://project--f8f74b06-8a19-4d35-9906-ba4e49b679e3.lovable.app/api/public/hooks/backup-mirror',
    headers := '{"Content-Type":"application/json","apikey":"YOUR_ANON_KEY"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
```

## Known limitations

- **Password hashes don't transfer.** Users will reset on first login after a failover.
- **The `auth.users.id` is preserved**, so all FK relationships (profiles, user_roles, submissions, etc.) stay intact.
- **Free-tier Supabase caps**: 500MB DB / 1GB storage. Upgrade the backup project when you grow past that — the admin UI will eventually start showing errors if quotas are hit.
- **Schema drift**: if you add a new migration in Lovable, also run that migration manually in the backup project's SQL editor, otherwise the next mirror run will fail with "column does not exist" for the new fields.
- **`backup_runs` table is primary-only** — it's intentionally excluded from the mirror loop.

## Monitoring

- `/admin/backups` auto-refreshes every 10 seconds while you're on the page.
- If three consecutive runs fail, investigate immediately — re-run "Test connection", check that the service role key hasn't been rotated, check the backup project's quota usage.
