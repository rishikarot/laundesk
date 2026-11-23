# Laundry Desk — Simple Role-Based MVP

## GitHub Pages frontend
Upload these files to the repository root:
- index.html
- styles.css
- app.js
- config.js
- HOW_TO_USE.html

The existing Supabase project is already configured. The `laundry-api` Edge Function is deployed as v7 / application API v1.3.0.

## Roles
- **Admin** — organization, staff, customer access, catalog, rates, discounts and all reports.
- **Manager** — daily operations, create orders/pickups, maintain customer details and business reports.
- **Delivery** — assigned pickups/deliveries and own activity reports.
- **Customer** — own pickup requests, orders, balance and reports only.

## Workflow
Default Quick Flow:
Pickup Requested → Collected → Received → In Progress → Ready → Delivered

Detailed stages remain available per order:
Pickup Requested → Collected → Received → Washing → Ironing → Ready → Out for Delivery → Delivered

## Customer setup
The operational demo data was reset while retaining the staff users. The database now contains 10 dummy sample customers plus **Rishi / 9895494496**. The seeded sample customer login code is `123456`.

Admin and Manager can edit customer name, mobile and address. Admin additionally controls access and login-code reset.

## Rates
Admin → Setup → Rates now supports:
- blank add row at the top,
- inline rate editing,
- inline effective-date editing,
- save-in-place without opening a modal.

## Reports
Role-scoped reports support Today, Yesterday, This Week, Last Week, This Month, Last Month, This Year and Custom ranges, with Day/Week/Month/Year grouping.

Admin/Manager: Overview, Customers, Operations, Payments, Calendar.
Delivery: own activity only.
Customer: own orders/payments/balance only.

The currently selected report can be downloaded as **Excel (.xlsx)** or **PDF**. Export libraries load only when the download button is used.

Period activity is separated from current position so date filtering does not distort outstanding balances or customer credit.

## Admin demo reset

Admin can open **Setup → System → Reset demo data** to clear operational test data and begin a fresh test cycle. The confirmation requires typing `RESET`.

The reset clears orders, order items, garment tags, workflow events, payments, customer credit ledger entries, login-attempt noise and prior Laundry Desk audit entries. It resets the demo order number sequence.

It retains staff users, customer accounts and login codes, organization settings, garments, services, rates and discounts. The current Admin session is retained, so testing can continue immediately after reset.


## Option A — Mixed-Service Collection & Customer Wallet

- Service-first garment collection: Wash Only, Wash + Iron, Iron Only and Dry Clean can be mixed in one order.
- Manager/Admin Home includes Counter Order, Pickup Request and Add Customer quick actions.
- Orders expose a direct Pay action for outstanding balances.
- Customer Account supports payments even without outstanding dues; excess becomes advance credit.
- Customer payments settle oldest outstanding orders first and keep only the excess as advance.
- Existing advance is auto-applied to newly priced orders and recorded as debit/credit ledger entries.
- Backend: Supabase `laundry-api` API v1.4.0.
