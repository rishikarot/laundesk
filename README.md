# Laundry Desk — Supabase MVP

Light, mobile-first laundry operations app connected to the existing **Shared Apps** Supabase project. The interface uses a simple task-first layout with a configurable accent color.

## Live backend

- Project ref: `bfmsoerewmiqianxmcck`
- Region: Singapore (`ap-southeast-1`)
- App prefix: `laundry_`
- Edge Function: `laundry-api`
- Currency: AED
- Timezone: Asia/Dubai

No existing TablePing/AppHub tables were changed by this implementation.

## Start the web app

For normal browser use, serve this folder as a static website. From this directory:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

The same files can be pushed to GitHub Pages. `config.js` contains only the Supabase **publishable** key; there is no server secret in the browser bundle.

## Demo logins

| Role | Login | Six-digit code |
|---|---|---:|
| Admin | `admin` | `111111` |
| Manager | `manager` | `222222` |
| Delivery | `driver` | `333333` |
| Customer | `+971501234567` | `444444` |

Change these before a real pilot.

## Main workflow

`Pickup requested → Collected → Received → Washing → Ironing → Ready → Out for delivery → Delivered`

Iron-only skips Washing. Counter orders start at Received and can go from Ready directly to Delivered.

Laundry status and payment status are deliberately separate. Partial payments and overpayments are recorded independently; excess becomes customer credit and can be applied later.

## Source structure

- `index.html` — app shell
- `styles.css` — minimal-brutalist responsive UI
- `app.js` — role workspaces and interactions
- `config.js` — project URL + publishable key
- `HOW_TO_USE.md` / `HOW_TO_USE.html` — user guide
- `TEST_REPORT.md` — verification summary
- `ARCHITECTURE.md` — security/data design
- `supabase/migrations/` — database scripts matching the live Laundry schema
- `supabase/functions/laundry-api/index.ts` — deployed Edge Function source
- `tests/db_integration_tests.sql` — rollback-safe DB test suite

## Production note

This MVP uses a Laundry-specific six-digit login system behind an Edge Function. It is appropriate for controlled pilot use. For broader production use, migrate staff accounts to Supabase Auth with stronger credentials/MFA while preserving the same role/data model. Customer PIN login can remain as a dedicated controlled flow if the business wants its simplicity.


## Appearance

Use the palette button in the top bar (or **Account → Theme color** for Delivery/Customer) to choose a preset or custom theme color. The setting is stored locally in the browser and does not change business data.

## Performance notes

- QR code library loads only when printing a receipt or label.
- Long order/list content uses browser content visibility to reduce rendering work.
- API calls have a 20-second timeout with a clear retry message.
- Supabase is preconnected from the page head to reduce first-request latency.
