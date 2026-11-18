# Supabase folder

The live Shared Apps project already has these migrations applied:

1. `001_laundry_desk_mvp.sql` — tables, RLS/grants, seed data and login function.
2. `002_secure_transactions.sql` — secure staff/customer upserts, server-side pricing, payment/credit transactions.
3. `003_fk_indexes.sql` — covering indexes for Laundry Desk foreign keys.

The deployed Edge Function source is in `functions/laundry-api/index.ts`.

All application tables use `laundry_`. Do not run the seed migration against another production database without changing the demo logins/codes first.
