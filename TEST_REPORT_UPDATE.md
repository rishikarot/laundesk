# Laundry Desk — Update QA Report

Date: 2026-11-23

## Live Supabase state
- Staff users retained: 3
- Customers seeded: 11 (10 dummy customers + Rishi)
- Rishi: 9895494496
- Seeded customer code: 123456
- Orders after reset: 0
- Payments after reset: 0
- Existing organization/catalog/rates/discounts retained
- `laundry-api` deployed as Edge Function version 7 / API v1.3.0

## Browser regression
19/19 checks passed using Chromium with mocked API responses:
- Admin shell
- Customer quick-add row
- Rishi visible
- Customer edit prefill
- Rate quick-add row
- Inline rate edit payload includes rate ID + new rate + effective date
- Excel export control
- PDF export control
- Excel export invocation
- PDF export invocation
- Manager shell
- Manager Customers navigation
- Manager quick-add customer
- Manager customer edit
- Manager cannot toggle customer access
- Delivery shell
- Delivery role navigation
- Customer shell
- Customer role navigation

## Database checks
- Customer secure update helper tested in a rollback transaction.
- Rate row update tested in a rollback transaction.
- Reset verification confirmed 3 staff, 11 customers, 0 orders and 0 payments.

## Notes
Excel/PDF libraries are loaded only when an export is requested. This keeps normal application startup light. Production GitHub Pages requires outbound browser access to the configured CDN URLs for these export libraries.
