-- Cover all Laundry Desk foreign keys used by lookups/deletes.
create index if not exists laundry_credit_order_idx on public.laundry_credit_ledger(order_id);
create index if not exists laundry_credit_payment_idx on public.laundry_credit_ledger(payment_id);
create index if not exists laundry_events_order_idx on public.laundry_order_events(order_id, created_at desc);
create index if not exists laundry_items_garment_idx on public.laundry_order_items(garment_type_id);
create index if not exists laundry_items_service_idx on public.laundry_order_items(service_id);
create index if not exists laundry_pieces_item_idx on public.laundry_order_pieces(order_item_id);
create index if not exists laundry_orders_creator_idx on public.laundry_orders(created_by_staff_id);
create index if not exists laundry_orders_discount_idx on public.laundry_orders(discount_id);
create index if not exists laundry_payments_collector_idx on public.laundry_payments(collected_by_staff_id);
create index if not exists laundry_rates_service_idx on public.laundry_rates(service_id);
create index if not exists laundry_sessions_customer_idx on public.laundry_sessions(customer_id);
create index if not exists laundry_sessions_staff_idx on public.laundry_sessions(staff_id);
