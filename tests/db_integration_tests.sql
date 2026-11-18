-- Rollback-safe Laundry Desk integration tests.
begin;
do $test$
declare
  v_ok boolean; v_limited boolean; v_customer uuid; v_manager uuid; v_driver uuid;
  v_shirt uuid; v_trouser uuid; v_wash uuid; v_iron uuid; v_o1 uuid; v_o2 uuid; v_o3 uuid;
  v_total numeric; v_pieces integer; v_applied numeric; v_credit numeric; v_remaining numeric; v_balance numeric;
  v_i integer; v_count integer;
begin
  select count(*) into v_count from pg_tables where schemaname='public' and tablename like 'laundry_%';
  if v_count <> 16 then raise exception 'Expected 16 laundry tables, got %', v_count; end if;

  if exists (select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname like 'laundry_%' and c.relkind='r' and not c.relrowsecurity)
  then raise exception 'A laundry table does not have RLS enabled'; end if;
  if has_table_privilege('anon','public.laundry_orders','select') then raise exception 'anon unexpectedly has SELECT'; end if;
  if has_table_privilege('authenticated','public.laundry_customers','select') then raise exception 'authenticated unexpectedly has SELECT'; end if;

  select a.ok into v_ok from public.laundry_authenticate('admin','111111','test-suite') a limit 1;
  if not coalesce(v_ok,false) then raise exception 'Admin login failed'; end if;
  select a.ok into v_ok from public.laundry_authenticate('+971501234567','444444','test-suite') a limit 1;
  if not coalesce(v_ok,false) then raise exception 'Customer login failed'; end if;

  for v_i in 1..5 loop perform * from public.laundry_authenticate('rate-test-nobody','000000','test-suite'); end loop;
  select a.rate_limited into v_limited from public.laundry_authenticate('rate-test-nobody','000000','test-suite') a limit 1;
  if not coalesce(v_limited,false) then raise exception 'Rate limit failed'; end if;

  select id into v_customer from public.laundry_customers where mobile='+971501234567';
  select id into v_manager from public.laundry_staff where login_id='manager';
  select id into v_driver from public.laundry_staff where login_id='driver';
  select id into v_shirt from public.laundry_garment_types where code='shirt';
  select id into v_trouser from public.laundry_garment_types where code='trouser';
  select id into v_wash from public.laundry_services where code='wash_iron';
  select id into v_iron from public.laundry_services where code='iron_only';

  insert into public.laundry_orders(customer_id,channel,laundry_status,pickup_driver_id,delivery_address,source_note,created_by_staff_id)
  values(v_customer,'pickup','pickup_requested',v_driver,'Test address','TEST_DOORSTEP',v_manager) returning id into v_o3;
  select r.total,r.piece_count into v_total,v_pieces from public.laundry_replace_order_items(v_o3,
    jsonb_build_array(jsonb_build_object('garment_type_id',v_shirt,'service_id',v_wash,'quantity',2))) r;
  if v_total <> 16 or v_pieces <> 2 then raise exception 'Doorstep pricing/pieces failed'; end if;

  insert into public.laundry_orders(customer_id,channel,laundry_status,source_note,created_by_staff_id)
  values(v_customer,'counter','received','TEST_COUNTER',v_manager) returning id into v_o1;
  select r.total,r.piece_count into v_total,v_pieces from public.laundry_replace_order_items(v_o1,
    jsonb_build_array(jsonb_build_object('garment_type_id',v_shirt,'service_id',v_wash,'quantity',2),jsonb_build_object('garment_type_id',v_trouser,'service_id',v_wash,'quantity',1))) r;
  if v_total <> 25 or v_pieces <> 3 then raise exception 'Counter pricing failed'; end if;
  select p.applied_amount,p.credit_added into v_applied,v_credit from public.laundry_record_payment_tx(v_o1,v_manager,30,'cash','shop','TEST_OVERPAY') p;
  if v_applied <> 25 or v_credit <> 5 then raise exception 'Overpayment failed'; end if;

  insert into public.laundry_orders(customer_id,channel,laundry_status,source_note,created_by_staff_id)
  values(v_customer,'counter','received','TEST_IRON_ONLY',v_manager) returning id into v_o2;
  select r.total,r.piece_count into v_total,v_pieces from public.laundry_replace_order_items(v_o2,
    jsonb_build_array(jsonb_build_object('garment_type_id',v_shirt,'service_id',v_iron,'quantity',1))) r;
  if v_total <> 4 or v_pieces <> 1 then raise exception 'Iron-only pricing failed'; end if;
  select c.applied_amount,c.credit_remaining into v_applied,v_remaining from public.laundry_apply_credit_tx(v_o2,v_manager,null) c;
  if v_applied <> 4 or v_remaining <> 1 then raise exception 'Credit application failed'; end if;
  select coalesce(sum(amount),0) into v_balance from public.laundry_credit_ledger where customer_id=v_customer;
  if v_balance < 1 then raise exception 'Credit ledger failed'; end if;
end
$test$;
rollback;
