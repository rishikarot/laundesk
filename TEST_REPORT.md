# Laundry Desk — Test Report

Date: 18 November 2026  
Backend: Supabase project `bfmsoerewmiqianxmcck` / `Shared Apps`

## Result

**Database/domain integration suite: PASS.** The suite was executed against the live database inside a transaction and rolled back, so test orders/payments were not left behind.

| Area | Test | Result |
|---|---|---|
| Isolation | Exactly 16 `laundry_` tables; existing app tables untouched | PASS |
| Security | RLS enabled on all Laundry tables | PASS |
| Security | `anon` cannot SELECT Laundry orders | PASS |
| Security | `authenticated` cannot SELECT Laundry customers | PASS |
| Login | Admin six-digit login | PASS |
| Login | Customer mobile + six-digit login | PASS |
| Login | 5 failed attempts then rate limit | PASS |
| Doorstep | 2 Wash+Iron shirts price to AED 16 | PASS |
| Tags | 2 garments generate 2 unique piece/tag records | PASS |
| Counter | 2 shirts + 1 trouser price to AED 25 | PASS |
| Payments | AED 30 received against AED 25 applies 25 + creates AED 5 credit | PASS |
| Iron only | 1 iron-only shirt prices to AED 4 | PASS |
| Credit | AED 4 credit applied to next order; AED 1 remains | PASS |
| Performance | All Laundry foreign keys have covering indexes | PASS |
| Project health | Supabase Health advisor | PASS — no findings |
| Edge deploy | `laundry-api` version 1 is ACTIVE | PASS |
| Source | `app.js` JavaScript syntax check | PASS |
| Source | Edge Function source deployed successfully by Supabase | PASS |

## UI verification note

The execution environment used for packaging blocks headless Chromium from navigating to both localhost and `file://` URLs (`ERR_BLOCKED_BY_ADMINISTRATOR`). Therefore an automated browser click-through could not be completed here. This is a tooling restriction, not an application HTTP error.

The UI was still validated through JavaScript syntax checks, server/domain integration tests, static route/action review, and successful Edge Function deployment. A short manual acceptance pass on a normal browser is recommended before real customer use; follow the scenarios below.

## Manual acceptance scenarios

1. Manager logs a pickup request and assigns Delivery.
2. Delivery captures garments at the door and optionally takes a partial payment.
3. Manager receives/processes the order through the stage queue.
4. Manager creates an Iron Only counter order and confirms Washing is skipped.
5. Manager records an overpayment and verifies customer credit.
6. Manager creates another order and applies that credit.
7. Delivery completes an assigned delivery with/without payment.
8. Customer logs in and verifies only their own records are visible.
9. Print receipt as PDF and print bag/garment labels; scan the order QR.
10. Open WhatsApp prefilled message and attach the saved PDF.

## Supabase advisor observations outside Laundry Desk

The shared project already has advisor warnings relating to existing `tp_*` SECURITY DEFINER functions and the existing `citext` extension location. Laundry Desk did not alter those objects because they belong to other applications. Review them separately before changing them.
