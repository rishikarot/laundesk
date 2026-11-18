# Laundry Desk — Architecture & Security

## Design

The browser never talks directly to `laundry_` tables. It calls one Supabase Edge Function, `laundry-api`.

**Browser → laundry-api → Postgres**

The browser contains only the Supabase publishable key. The Edge Function uses Supabase's server secret from its managed environment to access the database.

## Authorization

Laundry sessions use a random token. Only its SHA-256 hash is stored in `laundry_sessions`. Each request reloads the session and actor, then enforces the role server-side.

- Admin: configuration, accounts, all reports/orders.
- Manager: operational orders, assignments, stages, payments.
- Delivery: only assigned pickup/delivery work.
- Customer: only own orders and pickup requests.

Direct `anon` and `authenticated` table grants are revoked from all `laundry_` tables. RLS is enabled as an additional deny-by-default boundary.

## Login protection

Staff/customer six-digit codes are bcrypt-hashed with Postgres `pgcrypto`. Failed attempts are recorded in `laundry_login_attempts`; five failures inside ten minutes temporarily block the identifier.

## Accounting integrity

The client never supplies authoritative prices or totals. `laundry_replace_order_items` loads the current rate from the database and calculates line totals, discount, order total and piece tags.

`laundry_record_payment_tx` atomically splits money received into:

- amount applied to the order, and
- excess posted to customer credit.

`laundry_apply_credit_tx` atomically consumes that credit on a later order. This keeps order balances and customer credit reconciled.

## Status model

Laundry status is operational. Payment status is calculated from `order total - applied payments` and is not used to control the laundry workflow.

## Scale path

The current static web client + Edge Function + Postgres architecture is sufficient for a single laundry and modest multi-branch use. Add branch/tenant IDs before onboarding unrelated laundry companies. Do not introduce microservices or Kubernetes unless scale/integration pressure actually requires them.
