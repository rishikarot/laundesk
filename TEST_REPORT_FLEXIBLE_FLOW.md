# Laundry Desk v1.5.0 — Flexible Flow QA

## Browser regression
Result: **18 / 18 passed**

Validated:
- Manager Orders shows bulk pickup assignment panel.
- Pickup requests can be filtered by Building/Block.
- Building filter reduced the test route to the correct two orders.
- Select Visible selects multiple pickup orders.
- Bulk assignment sends all selected order IDs and one collection-boy ID in one request.
- Quick order view exposes every future milestone.
- Requested → Ready works directly with confirmation disabled.
- Customer directory includes Building/Block filter.
- Customer Building/Block filter returns the correct customer.
- Customer sorting control is present.
- Customer Edit includes Building/Block and Door No.
- Admin Setup includes Workflow settings.
- Confirm stage changes defaults to OFF.
- Workflow confirmation setting posts correctly when enabled.
- Delivery Stops includes Building/Block filter.
- Delivery Stops includes Building + Door / Customer sorting.
- Delivery Building/Block filtering keeps assigned route stops visible.

## Live Supabase verification
- `laundry_customers.building_block` and `laundry_customers.door_no` are present.
- 11 demo customers have Building/Block values; 10 have Door No. values.
- `laundry_settings.workflow.confirm_stage_changes` is `false` by default.
- `laundry_customers_building_block_idx` exists.
- `laundry-api` v1.5.0 deployed successfully as Edge Function version 10.
- No new Laundry Desk unindexed-foreign-key finding was introduced.

## Notes
- Quick-stage jumps are forward-only for Admin/Manager.
- Delivery users retain restricted operational actions for assigned work.
- When a pickup has no captured garments, moving to Collected opens the collection interface rather than creating an empty collected order.
