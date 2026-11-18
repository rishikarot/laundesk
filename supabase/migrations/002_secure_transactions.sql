-- Laundry Desk secure transaction helpers.
-- Applied to live Shared Apps project after 001_laundry_desk_mvp.sql.

create or replace function public.laundry_upsert_staff_secure(
  p_id uuid, p_login_id text, p_display_name text, p_role text,
  p_phone text, p_pin text, p_active boolean default true
) returns uuid
language plpgsql security invoker
set search_path = public, extensions
as $$
declare v_id uuid;
begin
  if p_role not in ('admin','manager','delivery') then raise exception 'Invalid role'; end if;
  if p_id is null then
    if p_pin is null or p_pin !~ '^[0-9]{6}$' then raise exception 'A six-digit PIN is required'; end if;
    insert into public.laundry_staff(login_id, display_name, role, phone, pin_hash, active)
    values (trim(p_login_id), trim(p_display_name), p_role, p_phone,
      extensions.crypt(p_pin, extensions.gen_salt('bf',10)), coalesce(p_active,true))
    returning id into v_id;
  else
    update public.laundry_staff
    set login_id=trim(p_login_id), display_name=trim(p_display_name), role=p_role, phone=p_phone,
        active=coalesce(p_active,true),
        pin_hash=case when p_pin is not null then extensions.crypt(p_pin, extensions.gen_salt('bf',10)) else pin_hash end
    where id=p_id returning id into v_id;
    if v_id is null then raise exception 'Staff not found'; end if;
  end if;
  return v_id;
end;
$$;

create or replace function public.laundry_upsert_customer_secure(
  p_id uuid, p_name text, p_mobile text, p_address text,
  p_pin text, p_access_enabled boolean default true
) returns uuid
language plpgsql security invoker
set search_path = public, extensions
as $$
declare v_id uuid;
begin
  if p_id is null then
    if p_pin is null or p_pin !~ '^[0-9]{6}$' then raise exception 'A six-digit PIN is required'; end if;
    insert into public.laundry_customers(name, mobile, address, access_enabled, pin_hash)
    values (trim(p_name), trim(p_mobile), p_address, coalesce(p_access_enabled,true),
      extensions.crypt(p_pin, extensions.gen_salt('bf',10)))
    returning id into v_id;
  else
    update public.laundry_customers
    set name=trim(p_name), mobile=trim(p_mobile), address=p_address,
        access_enabled=coalesce(p_access_enabled,true),
        pin_hash=case when p_pin is not null then extensions.crypt(p_pin, extensions.gen_salt('bf',10)) else pin_hash end
    where id=p_id returning id into v_id;
    if v_id is null then raise exception 'Customer not found'; end if;
  end if;
  return v_id;
end;
$$;

create or replace function public.laundry_replace_order_items(p_order_id uuid, p_items jsonb)
returns table(subtotal numeric, discount_amount numeric, total numeric, piece_count integer)
language plpgsql security invoker
set search_path = public
as $$
declare
  v_order public.laundry_orders%rowtype;
  v_item jsonb; v_qty integer; v_price numeric(12,2); v_line numeric(12,2);
  v_subtotal numeric(12,2) := 0; v_discount numeric(12,2) := 0; v_total numeric(12,2) := 0;
  v_item_id uuid; v_piece integer := 0; v_i integer;
  v_discount_type text; v_discount_value numeric(12,2);
begin
  select * into v_order from public.laundry_orders where id=p_order_id for update;
  if not found then raise exception 'Order not found'; end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items)=0 then raise exception 'At least one item is required'; end if;

  delete from public.laundry_order_pieces where order_id=p_order_id;
  delete from public.laundry_order_items where order_id=p_order_id;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_qty := greatest(0, coalesce((v_item->>'quantity')::integer,0));
    if v_qty <= 0 then continue; end if;
    select r.unit_price into v_price
    from public.laundry_rates r
    where r.garment_type_id=(v_item->>'garment_type_id')::uuid
      and r.service_id=(v_item->>'service_id')::uuid
      and r.active=true and r.effective_from <= current_date
      and (r.effective_to is null or r.effective_to >= current_date)
    order by r.effective_from desc limit 1;
    if v_price is null then raise exception 'No active rate found for one of the selected items'; end if;
    v_line := v_price * v_qty; v_subtotal := v_subtotal + v_line;
    insert into public.laundry_order_items(order_id, garment_type_id, service_id, quantity, unit_price, line_total)
    values (p_order_id, (v_item->>'garment_type_id')::uuid, (v_item->>'service_id')::uuid, v_qty, v_price, v_line)
    returning id into v_item_id;
    for v_i in 1..v_qty loop
      v_piece := v_piece + 1;
      insert into public.laundry_order_pieces(order_id, order_item_id, piece_no, tag_code)
      values (p_order_id, v_item_id, v_piece, v_order.order_no || '-' || lpad(v_piece::text,3,'0'));
    end loop;
  end loop;
  if v_piece=0 then raise exception 'At least one item is required'; end if;

  if v_order.discount_id is not null then
    select d.discount_type, d.value into v_discount_type, v_discount_value
    from public.laundry_discounts d where d.id=v_order.discount_id and d.active=true;
    if v_discount_type='percent' then v_discount := round(v_subtotal * least(v_discount_value,100) / 100, 2);
    elsif v_discount_type='fixed' then v_discount := least(v_subtotal, v_discount_value); end if;
  end if;
  v_total := greatest(0, v_subtotal-v_discount);
  update public.laundry_orders set subtotal=v_subtotal, discount_amount=v_discount, total=v_total where id=p_order_id;
  return query select v_subtotal, v_discount, v_total, v_piece;
end;
$$;

create or replace function public.laundry_record_payment_tx(
  p_order_id uuid, p_collected_by uuid, p_received_amount numeric,
  p_method text, p_context text, p_note text default null
) returns table(payment_id uuid, applied_amount numeric, credit_added numeric)
language plpgsql security invoker
set search_path = public
as $$
declare
  v_order public.laundry_orders%rowtype; v_paid numeric(12,2); v_outstanding numeric(12,2);
  v_applied numeric(12,2); v_credit numeric(12,2); v_payment uuid;
begin
  if p_received_amount <= 0 then raise exception 'Payment must be greater than zero'; end if;
  if p_method not in ('cash','card','bank','other') then raise exception 'Invalid payment method'; end if;
  if p_context not in ('pickup','shop','delivery') then raise exception 'Invalid payment context'; end if;
  select * into v_order from public.laundry_orders where id=p_order_id for update;
  if not found then raise exception 'Order not found'; end if;
  select coalesce(sum(amount),0) into v_paid from public.laundry_payments where order_id=p_order_id;
  v_outstanding := greatest(0, v_order.total-v_paid);
  v_applied := least(p_received_amount, v_outstanding); v_credit := p_received_amount-v_applied;
  insert into public.laundry_payments(order_id, customer_id, amount, received_amount, method, payment_context, collected_by_staff_id, note)
  values (p_order_id, v_order.customer_id, v_applied, p_received_amount, p_method, p_context, p_collected_by, p_note)
  returning id into v_payment;
  if v_credit > 0 then
    insert into public.laundry_credit_ledger(customer_id, order_id, payment_id, amount, entry_type, note)
    values (v_order.customer_id, p_order_id, v_payment, v_credit, 'overpayment', 'Excess payment carried as customer credit');
  end if;
  return query select v_payment, v_applied, v_credit;
end;
$$;

create or replace function public.laundry_apply_credit_tx(
  p_order_id uuid, p_collected_by uuid, p_amount numeric default null
) returns table(payment_id uuid, applied_amount numeric, credit_remaining numeric)
language plpgsql security invoker
set search_path = public
as $$
declare
  v_order public.laundry_orders%rowtype; v_paid numeric(12,2); v_outstanding numeric(12,2);
  v_credit numeric(12,2); v_apply numeric(12,2); v_payment uuid;
begin
  select * into v_order from public.laundry_orders where id=p_order_id for update;
  if not found then raise exception 'Order not found'; end if;
  select coalesce(sum(amount),0) into v_paid from public.laundry_payments where order_id=p_order_id;
  select coalesce(sum(amount),0) into v_credit from public.laundry_credit_ledger where customer_id=v_order.customer_id;
  v_outstanding := greatest(0, v_order.total-v_paid);
  v_apply := least(v_outstanding, greatest(0, v_credit), coalesce(nullif(p_amount,0), v_outstanding));
  if v_apply <= 0 then raise exception 'No customer credit can be applied to this order'; end if;
  insert into public.laundry_payments(order_id, customer_id, amount, received_amount, method, payment_context, collected_by_staff_id, note)
  values (p_order_id, v_order.customer_id, v_apply, 0, 'credit', 'credit', p_collected_by, 'Applied customer credit')
  returning id into v_payment;
  insert into public.laundry_credit_ledger(customer_id, order_id, payment_id, amount, entry_type, note)
  values (v_order.customer_id, p_order_id, v_payment, -v_apply, 'application', 'Applied to order '||v_order.order_no);
  return query select v_payment, v_apply, v_credit-v_apply;
end;
$$;

revoke all on function public.laundry_upsert_staff_secure(uuid,text,text,text,text,text,boolean) from public, anon, authenticated;
grant execute on function public.laundry_upsert_staff_secure(uuid,text,text,text,text,text,boolean) to service_role;
revoke all on function public.laundry_upsert_customer_secure(uuid,text,text,text,text,boolean) from public, anon, authenticated;
grant execute on function public.laundry_upsert_customer_secure(uuid,text,text,text,text,boolean) to service_role;
revoke all on function public.laundry_replace_order_items(uuid,jsonb) from public, anon, authenticated;
grant execute on function public.laundry_replace_order_items(uuid,jsonb) to service_role;
revoke all on function public.laundry_record_payment_tx(uuid,uuid,numeric,text,text,text) from public, anon, authenticated;
grant execute on function public.laundry_record_payment_tx(uuid,uuid,numeric,text,text,text) to service_role;
revoke all on function public.laundry_apply_credit_tx(uuid,uuid,numeric) from public, anon, authenticated;
grant execute on function public.laundry_apply_credit_tx(uuid,uuid,numeric) to service_role;
