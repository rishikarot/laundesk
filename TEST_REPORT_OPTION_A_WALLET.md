# Laundry Desk — Option A + Customer Wallet QA

## Result

- Browser UX smoke: **12/12 passed**.
- Mixed-service database pricing: **passed** — Shirt / Wash+Iron + Trouser / Wash Only + Dress / Dry Clean produced 3 distinct order lines and correct total.
- Advance auto-consumption: **passed** — AED 100 advance funded a AED 37 mixed-service order, leaving AED 63 wallet balance in rollback test.
- Customer-level payment allocation: **passed** — AED 40 against AED 25 due settled AED 25 and created AED 15 advance in rollback test.
- Direct browser execution of customer-payment RPC: **blocked** for anon/authenticated roles; service role only.
- Services live: Wash Only, Wash + Iron, Iron Only, Dry Clean.
- Active starter rates: 7 Wash Only + 7 Dry Clean rates added; existing Wash + Iron / Iron Only rates retained.
- Edge Function deployed: `laundry-api` v9 / API 1.4.0.

## UI verified

1. Admin and Manager Home show 3 quick actions: Counter order, Pickup request, Add customer.
2. Manager Create navigation removed to reduce duplication.
3. Counter collection uses service-first chips and retains quantities while switching services.
4. Delivery collection uses the same service-first mixed-service interaction.
5. Mixed services submit as separate order lines.
6. Orders show a direct Pay action when money is due.
7. Customer rows show Account action.
8. Customer Account shows Outstanding, Advance/Credit, Net Position, wallet ledger and Receive Payment.
9. Admin can configure Dry Clean and other service workflows.
