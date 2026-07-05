## Goal

Let authors submit articles without paying first, while giving admins a clean, filterable overview of every submission — including who submitted, when, and their payment/membership status.

## 1. Remove the payment gate on `/submit`

In `src/routes/_authenticated.submit.tsx`:
- Drop the `membershipStatus` check and the "Membership Pending / Required" gate screens.
- Anyone signed in can submit. Membership plan (`single / annual / lifetime / institute`) stays in the form as a self-declared field so admin still sees intent.
- Keep the manuscript upload + validation unchanged.
- After submit, redirect to `/dashboard` with a success toast (same as today).

## 2. Enrich admin submissions view

In `src/routes/_authenticated.admin.submissions.tsx`, load author + payment context alongside submissions:
- Join each row with `profiles` (full_name, email) and the author's latest `membership_payments` row (status + plan) using two extra queries keyed by `user_id`.
- New table columns: **Author**, **Submitted on** (date + relative "3 days ago"), **Plan (declared)**, **Membership status** (Approved / Pending / None — colored badge), **Title**, **Status**, **Actions**.

## 3. Filter & overview bar

Add a sticky filter bar above the table:
- Search box (title / author name / email) — existing `filter` reused.
- Status dropdown (all + each submission status).
- Membership filter (all / paid / pending / none).
- **Date range** buttons: Today · This week · This month · All time · Custom (two date pickers).
- Small summary chips on top: Total, This week, Pending review, Paid members — computed from the filtered set.

## 4. Nicer layout

- Group rows visually by day header ("4 July 2026 — 3 submissions") when "All time" is selected, for scan-friendliness.
- Zebra rows, compact spacing, right-aligned actions.
- Keep the existing promote-to-article dialog intact.

## Technical notes

- No schema changes. All new data comes from existing `submissions`, `profiles`, `membership_payments` tables.
- Date filtering done client-side on `created_at` (dataset is small); `date-fns` already available.
- Membership badge logic: latest payment row per user → approved > pending > none.
- Author lookup: one `profiles.select("id, full_name").in("id", userIds)` + one `membership_payments.select("user_id,status,plan,created_at").in("user_id", userIds)` after loading submissions.

## Out of scope

- Removing `membership_payments` table or the `/membership` page — payments stay available for users who want to pay; only the hard gate on `/submit` is lifted.
- No changes to moderator queue.
