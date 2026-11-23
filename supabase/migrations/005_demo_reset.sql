create or replace function public.laundry_reset_demo_data(p_actor_id uuid)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_orders integer := 0;
  v_payments integer := 0;
  v_credits integer := 0;
  v_events integer := 0;
  v_items integer := 0;
  v_pieces integer := 0;
begin
  select count(*) into v_orders from public.laundry_orders;
  select count(*) into v_payments from public.laundry_payments;
  select count(*) into v_credits from public.laundry_credit_ledger;
  select count(*) into v_events from public.laundry_order_events;
  select count(*) into v_items from public.laundry_order_items;
  select count(*) into v_pieces from public.laundry_order_pieces;

  delete from public.laundry_credit_ledger;
  delete from public.laundry_payments;
  delete from public.laundry_order_events;
  delete from public.laundry_order_pieces;
  delete from public.laundry_order_items;
  delete from public.laundry_orders;
  delete from public.laundry_login_attempts;
  delete from public.laundry_audit_log;

  perform setval('public.laundry_order_no_seq', 1001, false);

  insert into public.laundry_audit_log(actor_type, actor_id, action, entity_type, entity_id, details)
  values ('staff', p_actor_id, 'demo_data_reset', 'system', 'demo', jsonb_build_object(
    'orders', v_orders, 'payments', v_payments, 'credits', v_credits,
    'events', v_events, 'items', v_items, 'pieces', v_pieces
  ));

  return jsonb_build_object(
    'orders', v_orders, 'payments', v_payments, 'credits', v_credits,
    'events', v_events, 'items', v_items, 'pieces', v_pieces
  );
end;
$$;

revoke all on function public.laundry_reset_demo_data(uuid) from public, anon, authenticated;
grant execute on function public.laundry_reset_demo_data(uuid) to service_role;
