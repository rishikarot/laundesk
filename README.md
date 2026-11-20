# Laundry Desk — Quick Workflow + Reports

## GitHub Pages frontend
Upload these files to the repository root:
- index.html
- styles.css
- app.js
- config.js
- HOW_TO_USE.html

The existing Supabase project is already configured. The `laundry-api` Edge Function is deployed as v4.

## Workflow
Default Quick Flow:
Pickup Requested → Collected → Received → In Progress → Ready → Delivered

Detailed stages remain available per order:
Pickup Requested → Collected → Received → Washing → Ironing → Ready → Out for Delivery → Delivered

## Reports
Role-scoped reports support Today, Yesterday, This Week, Last Week, This Month, Last Month, This Year and Custom ranges, with Day/Week/Month/Year grouping.

Admin/Manager: Overview, Customers, Operations, Payments, Calendar.
Delivery: own activity only.
Customer: own orders/payments/balance only.

Period activity is separated from current position so date filtering does not distort outstanding balances or customer credit.
