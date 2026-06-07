## Root cause

The latest backup runs show the same failures the user reported:

- `categories` fails because the backup project already has a seeded row with the same `slug` (`agronomy`) but a different `id`.
- `site_content` fails for the same reason on its natural unique key: `(page, section, key)`.
- `articles` and `submissions` then fail because their `category_id` values point to the production category IDs, but those category rows were not inserted into the backup project.

The intended cleanup was added, but it deletes conflicting rows using the primary-key column named in `conflict`. That only works when the mirror conflict target is a real column named `id`. It is not robust enough for tables where the backup schema’s uniqueness is enforced by natural keys, and it does not guarantee the mirror uses the backup table’s actual unique constraints.

## Implementation plan

1. Update the mirror table configuration in `src/lib/backup.functions.ts`
   - Separate the primary key used for preserving production IDs from the unique conflict target used by the backup database.
   - Use natural unique keys directly for tables that have them:
     - `categories`: `slug`
     - `issues`: `volume,issue_number`
     - `user_roles`: `user_id,role`
     - `site_content`: `page,section,key`
     - `membership_payments`: `member_id`
     - `articles`: `slug`
   - Keep `id` for tables that do not have a better natural key.

2. Make conflict cleanup deterministic
   - Before upserting each batch, delete backup rows that match any configured natural key but have a different production `id`.
   - This removes bootstrap/seed rows that would otherwise block preserving production IDs.
   - Keep parent tables first (`categories` before `articles`/`submissions`) so foreign keys resolve.

3. Improve diagnostics for the next run
   - Record whether a table was cleaned/upserted or failed in `backup_runs.details`.
   - Keep the existing admin UI behavior, but the stored run details will make future failures easier to identify.

4. Verification after implementation
   - Run lint/type validation through the normal harness.
   - Re-run the backup mirror from `/admin/backups` or the backup hook.
   - Confirm the next `backup_runs` row no longer has duplicate-key errors for `categories`/`site_content` and no longer has missing-category foreign-key errors for `articles`/`submissions`.

## Notes

- The backup URL/key you pasted appear to be the backup project credentials. I will not hardcode them into the app; the existing secrets are already used for this connection.
- No database schema migration is needed for the primary app database. This is a mirror logic fix.