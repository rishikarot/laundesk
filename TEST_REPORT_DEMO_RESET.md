# Laundry Desk — Demo Reset Regression

## Result

- UI/browser regression: **22/22 passed**
- Database reset function: **PASS** inside rollback transaction
- Live Edge Function deployed: **laundry-api v8 / API 1.3.1**

## Verified reset behavior

The test created temporary order, payment and customer-credit records, invoked `laundry_reset_demo_data`, verified zero operational records remained, and then rolled the test back.

Retained during the test:

- 3 staff accounts
- 11 customer accounts
- rate/catalog configuration

Also verified in Chromium:

- Admin System tab is visible
- reset button opens confirmation modal
- `RESET` confirmation is required
- reset API payload is sent only after confirmation
- existing customer/rate/report/role UI regression suite continues to pass
