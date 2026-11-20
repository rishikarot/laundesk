# Laundry Desk — Regression Test Report

Date: 20 Nov 2026

## Issues fixed

1. **Profile rendering** — Delivery/other Account pages could show the literal `${esc(a.display_name)}` instead of the signed-in user name. The profile title now renders the actual escaped display name.
2. **Reports HTTP 500** — the monthly calendar end date was converted to a number and later used as a `Date`. This caused every `/reports` request to fail after its database reads. The report function now keeps the calendar end value as a real `Date`.
3. **Profile layout** — the small Role card no longer stretches to the full height of the Appearance card.
4. **Catalog edge cases** — Counter/Pickup item capture now handles disabled services gracefully and prevents choosing garments without an active rate for the selected service.

## Automated UI regression

Chromium test suite: **12/12 passed**.

- Admin: business settings
- Admin: staff creation
- Admin: customer create/access/reset code
- Admin: rates, garments, services, discounts
- Admin: Graphite/Light theme and all report presets/tabs
- Manager: counter order and pickup request
- Manager: Quick flow, detailed stages, payments, credit, driver assignment
- Manager: receipt/PDF and WhatsApp actions
- Delivery: doorstep collection
- Delivery: delivery handover + payment
- Delivery: Account, Reports and mobile Exit visibility
- Customer: pickup request, own reports and account

Processing-state test: **PASS** — clicked async actions disable immediately, show the processing state/text and release after completion.

## Report backend regression

The actual `buildReports` server function was executed against a mocked Supabase query layer for all four roles. **4/4 passed**:

- Admin report scope and calendar: PASS
- Manager report scope and calendar: PASS
- Delivery own activity scope: PASS
- Customer own-data scope: PASS

This test exercises the calendar/date path that caused the previous HTTP 500.

## Live Supabase validation

- `laundry-api`: ACTIVE, deployed as Edge Function version 6
- Laundry tables: 16
- Laundry tables without RLS: 0
- `anon` direct SELECT on `laundry_orders`: denied
- `authenticated` direct SELECT on `laundry_customers`: denied
- Orphan order items: 0
- Orphan garment pieces: 0
- Orphan payments: 0
- Orphan workflow events: 0
- Invalid negative order/payment amounts: 0
- Negative customer-credit balances: 0
- Active services: 2
- Active garments: 7
- Supabase Health advisor: no findings
- Performance advisor: no unindexed-foreign-key finding for any Laundry Desk table

## Notes

The Supabase Security advisor reports `RLS enabled, no policy` informational notices for Laundry Desk by design: browser roles have no direct Laundry table grants and the application uses the server-side `laundry-api` Edge Function as its gateway. The project also contains security notices belonging to other pre-existing TablePing/Auth objects; they were not changed as part of this Laundry Desk regression fix.
