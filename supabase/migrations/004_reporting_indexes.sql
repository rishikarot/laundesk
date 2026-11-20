create index if not exists laundry_orders_created_at_idx
  on public.laundry_orders(created_at desc);
create index if not exists laundry_orders_updated_at_idx
  on public.laundry_orders(updated_at desc);
create index if not exists laundry_events_status_created_idx
  on public.laundry_order_events(to_status, created_at desc);
create index if not exists laundry_events_actor_created_idx
  on public.laundry_order_events(actor_id, created_at desc);
create index if not exists laundry_payments_created_at_idx
  on public.laundry_payments(created_at desc);
create index if not exists laundry_payments_collector_created_idx
  on public.laundry_payments(collected_by_staff_id, created_at desc);
create index if not exists laundry_credit_created_at_idx
  on public.laundry_credit_ledger(created_at desc);
