-- Laundry Desk MVP schema for Supabase Shared Apps project
-- All application tables use the laundry_ prefix.

create sequence if not exists public.laundry_customer_code_seq start 1001;
create sequence if not exists public.laundry_order_no_seq start 1001;

create table if not exists public.laundry_staff (
  id uuid primary key default gen_random_uuid(),
  login_id citext not null unique,
  display_name text not null,
  role text not null check (role in ('admin','manager','delivery')),
  phone text,
  pin_hash text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.laundry_customers (
  id uuid primary key default gen_random_uuid(),
  customer_code text not null unique default ('C' || lpad(nextval('public.laundry_customer_code_seq')::text, 5, '0')),
  name text not null,
  mobile citext not null unique,
  address text,
  access_enabled boolean not null default true,
  pin_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.laundry_garment_types (
  id uuid primary key default gen_random_uuid(),
  code citext not null unique,
  name text not null,
  active boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.laundry_services (
  id uuid primary key default gen_random_uuid(),
  code citext not null unique,
  name text not null,
  workflow text not null check (workflow in ('wash_iron','iron_only')),
  active boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.laundry_rates (
  id uuid primary key default gen_random_uuid(),
  garment_type_id uuid not null references public.laundry_garment_types(id),
  service_id uuid not null references public.laundry_services(id),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  active boolean not null default true,
  effective_from date not null default current_date,
  effective_to date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (garment_type_id, service_id, effective_from)
);

create table if not exists public.laundry_discounts (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  discount_type text not null check (discount_type in ('percent','fixed')),
  value numeric(12,2) not null check (value >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.laundry_orders (
  id uuid primary key default gen_random_uuid(),
  order_no text not null unique default ('LD-' || to_char(now(), 'YYMMDD') || '-' || lpad(nextval('public.laundry_order_no_seq')::text, 5, '0')),
  customer_id uuid not null references public.laundry_customers(id),
  channel text not null check (channel in ('pickup','counter')),
  laundry_status text not null check (laundry_status in ('pickup_requested','collected','received','washing','ironing','ready','out_for_delivery','delivered')),
  pickup_driver_id uuid references public.laundry_staff(id),
  delivery_driver_id uuid references public.laundry_staff(id),
  delivery_address text,
  source_note text,
  discount_id uuid references public.laundry_discounts(id),
  subtotal numeric(12,2) not null default 0 check (subtotal >= 0),
  discount_amount numeric(12,2) not null default 0 check (discount_amount >= 0),
  total numeric(12,2) not null default 0 check (total >= 0),
  created_by_staff_id uuid references public.laundry_staff(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  delivered_at timestamptz
);

create table if not exists public.laundry_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.laundry_orders(id) on delete cascade,
  garment_type_id uuid not null references public.laundry_garment_types(id),
  service_id uuid not null references public.laundry_services(id),
  quantity integer not null check (quantity > 0),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  line_total numeric(12,2) not null check (line_total >= 0),
  created_at timestamptz not null default now(),
  unique(order_id, garment_type_id, service_id)
);

create table if not exists public.laundry_order_pieces (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.laundry_orders(id) on delete cascade,
  order_item_id uuid not null references public.laundry_order_items(id) on delete cascade,
  piece_no integer not null check (piece_no > 0),
  tag_code text not null unique,
  created_at timestamptz not null default now(),
  unique(order_id, piece_no)
);

create table if not exists public.laundry_order_events (
  id bigserial primary key,
  order_id uuid not null references public.laundry_orders(id) on delete cascade,
  from_status text,
  to_status text not null,
  actor_type text not null check (actor_type in ('staff','customer','system')),
  actor_id uuid,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.laundry_payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.laundry_orders(id),
  customer_id uuid not null references public.laundry_customers(id),
  amount numeric(12,2) not null check (amount >= 0),
  received_amount numeric(12,2) not null check (received_amount >= 0),
  method text not null check (method in ('cash','card','bank','credit','other')),
  payment_context text not null check (payment_context in ('pickup','shop','delivery','credit')),
  collected_by_staff_id uuid references public.laundry_staff(id),
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.laundry_credit_ledger (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.laundry_customers(id),
  order_id uuid references public.laundry_orders(id),
  payment_id uuid references public.laundry_payments(id),
  amount numeric(12,2) not null check (amount <> 0),
  entry_type text not null check (entry_type in ('overpayment','application','adjustment')),
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.laundry_sessions (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique,
  actor_type text not null check (actor_type in ('staff','customer')),
  staff_id uuid references public.laundry_staff(id) on delete cascade,
  customer_id uuid references public.laundry_customers(id) on delete cascade,
  role text not null,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  expires_at timestamptz not null,
  check ((actor_type='staff' and staff_id is not null and customer_id is null) or (actor_type='customer' and customer_id is not null and staff_id is null))
);

create table if not exists public.laundry_login_attempts (
  id bigserial primary key,
  identifier text not null,
  ip_address text,
  success boolean not null,
  reason text,
  attempted_at timestamptz not null default now()
);

create table if not exists public.laundry_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.laundry_audit_log (
  id bigserial primary key,
  actor_type text not null check (actor_type in ('staff','customer','system')),
  actor_id uuid,
  action text not null,
  entity_type text not null,
  entity_id text,
  details jsonb,
  created_at timestamptz not null default now()
);

create index if not exists laundry_orders_customer_idx on public.laundry_orders(customer_id, created_at desc);
create index if not exists laundry_orders_status_idx on public.laundry_orders(laundry_status, created_at desc);
create index if not exists laundry_orders_pickup_driver_idx on public.laundry_orders(pickup_driver_id, laundry_status);
create index if not exists laundry_orders_delivery_driver_idx on public.laundry_orders(delivery_driver_id, laundry_status);
create index if not exists laundry_items_order_idx on public.laundry_order_items(order_id);
create index if not exists laundry_pieces_order_idx on public.laundry_order_pieces(order_id, piece_no);
create index if not exists laundry_payments_order_idx on public.laundry_payments(order_id, created_at);
create index if not exists laundry_payments_customer_idx on public.laundry_payments(customer_id, created_at desc);
create index if not exists laundry_credit_customer_idx on public.laundry_credit_ledger(customer_id, created_at desc);
create index if not exists laundry_login_attempts_lookup_idx on public.laundry_login_attempts(identifier, attempted_at desc);
create index if not exists laundry_sessions_token_idx on public.laundry_sessions(token_hash, expires_at);

create or replace function public.laundry_touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.laundry_authenticate(p_identifier text, p_pin text, p_ip text default null)
returns table(
  ok boolean,
  rate_limited boolean,
  actor_type text,
  actor_id uuid,
  actor_role text,
  display_name text,
  customer_code text,
  reason text
)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_identifier text := lower(trim(p_identifier));
  v_failed_count integer;
  v_staff public.laundry_staff%rowtype;
  v_customer public.laundry_customers%rowtype;
begin
  select count(*) into v_failed_count
  from public.laundry_login_attempts
  where lower(identifier) = v_identifier
    and success = false
    and attempted_at >= now() - interval '10 minutes';

  if v_failed_count >= 5 then
    return query select false, true, null::text, null::uuid, null::text, null::text, null::text, 'Too many failed attempts. Try again later.'::text;
    return;
  end if;

  select * into v_staff
  from public.laundry_staff
  where lower(login_id::text) = v_identifier
  limit 1;

  if found then
    if not v_staff.active then
      insert into public.laundry_login_attempts(identifier, ip_address, success, reason)
      values (v_identifier, p_ip, false, 'staff_disabled');
      return query select false, false, 'staff'::text, v_staff.id, v_staff.role, v_staff.display_name, null::text, 'Account disabled.'::text;
      return;
    end if;

    if extensions.crypt(p_pin, v_staff.pin_hash) = v_staff.pin_hash then
      insert into public.laundry_login_attempts(identifier, ip_address, success, reason)
      values (v_identifier, p_ip, true, 'ok');
      return query select true, false, 'staff'::text, v_staff.id, v_staff.role, v_staff.display_name, null::text, 'ok'::text;
    else
      insert into public.laundry_login_attempts(identifier, ip_address, success, reason)
      values (v_identifier, p_ip, false, 'invalid_pin');
      return query select false, false, 'staff'::text, v_staff.id, v_staff.role, v_staff.display_name, null::text, 'Invalid login.'::text;
    end if;
    return;
  end if;

  select * into v_customer
  from public.laundry_customers
  where lower(mobile::text) = v_identifier
  limit 1;

  if found then
    if not v_customer.access_enabled then
      insert into public.laundry_login_attempts(identifier, ip_address, success, reason)
      values (v_identifier, p_ip, false, 'customer_access_disabled');
      return query select false, false, 'customer'::text, v_customer.id, 'customer'::text, v_customer.name, v_customer.customer_code, 'Customer access disabled.'::text;
      return;
    end if;

    if extensions.crypt(p_pin, v_customer.pin_hash) = v_customer.pin_hash then
      insert into public.laundry_login_attempts(identifier, ip_address, success, reason)
      values (v_identifier, p_ip, true, 'ok');
      return query select true, false, 'customer'::text, v_customer.id, 'customer'::text, v_customer.name, v_customer.customer_code, 'ok'::text;
    else
      insert into public.laundry_login_attempts(identifier, ip_address, success, reason)
      values (v_identifier, p_ip, false, 'invalid_pin');
      return query select false, false, 'customer'::text, v_customer.id, 'customer'::text, v_customer.name, v_customer.customer_code, 'Invalid login.'::text;
    end if;
    return;
  end if;

  insert into public.laundry_login_attempts(identifier, ip_address, success, reason)
  values (v_identifier, p_ip, false, 'unknown_identifier');
  return query select false, false, null::text, null::uuid, null::text, null::text, null::text, 'Invalid login.'::text;
end;
$$;

-- Updated-at triggers
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['laundry_staff','laundry_customers','laundry_garment_types','laundry_services','laundry_rates','laundry_discounts','laundry_orders']
  LOOP
    EXECUTE format('drop trigger if exists %I on public.%I', t || '_touch_updated_at', t);
    EXECUTE format('create trigger %I before update on public.%I for each row execute function public.laundry_touch_updated_at()', t || '_touch_updated_at', t);
  END LOOP;
END $$;

-- RLS: tables are server-only. The Edge Function uses service_role.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'laundry_staff','laundry_customers','laundry_garment_types','laundry_services','laundry_rates','laundry_discounts',
    'laundry_orders','laundry_order_items','laundry_order_pieces','laundry_order_events','laundry_payments','laundry_credit_ledger',
    'laundry_sessions','laundry_login_attempts','laundry_settings','laundry_audit_log'
  ]
  LOOP
    EXECUTE format('alter table public.%I enable row level security', t);
    EXECUTE format('revoke all on table public.%I from anon, authenticated', t);
    EXECUTE format('grant select, insert, update, delete on table public.%I to service_role', t);
  END LOOP;
END $$;

revoke all on sequence public.laundry_customer_code_seq from anon, authenticated;
revoke all on sequence public.laundry_order_no_seq from anon, authenticated;
grant usage, select, update on sequence public.laundry_customer_code_seq to service_role;
grant usage, select, update on sequence public.laundry_order_no_seq to service_role;

revoke all on function public.laundry_authenticate(text,text,text) from public, anon, authenticated;
grant execute on function public.laundry_authenticate(text,text,text) to service_role;
revoke all on function public.laundry_touch_updated_at() from public, anon, authenticated;
grant execute on function public.laundry_touch_updated_at() to service_role;

-- Demo staff accounts. Six-digit PINs are hashed with pgcrypto bcrypt.
insert into public.laundry_staff(login_id, display_name, role, phone, pin_hash, active)
values
  ('admin', 'Amina — Admin', 'admin', '+971500000101', extensions.crypt('111111', extensions.gen_salt('bf', 10)), true),
  ('manager', 'Khalid — Manager', 'manager', '+971500000102', extensions.crypt('222222', extensions.gen_salt('bf', 10)), true),
  ('driver', 'Rafi — Delivery', 'delivery', '+971500000103', extensions.crypt('333333', extensions.gen_salt('bf', 10)), true)
on conflict (login_id) do update set
  display_name = excluded.display_name,
  role = excluded.role,
  phone = excluded.phone,
  active = true;

insert into public.laundry_customers(customer_code, name, mobile, address, access_enabled, pin_hash)
values
  ('C01001', 'Sara Demo', '+971501234567', 'Al Qusais, Dubai', true, extensions.crypt('444444', extensions.gen_salt('bf', 10))),
  ('C01002', 'Omar Demo', '+971509876543', 'Al Nahda, Dubai', true, extensions.crypt('555555', extensions.gen_salt('bf', 10)))
on conflict (mobile) do update set
  name = excluded.name,
  address = excluded.address,
  access_enabled = true;

insert into public.laundry_garment_types(code, name, sort_order) values
  ('shirt', 'Shirt', 10),
  ('trouser', 'Trouser', 20),
  ('tshirt', 'T-Shirt', 30),
  ('dress', 'Dress', 40),
  ('abaya', 'Abaya', 50),
  ('bedsheet', 'Bed Sheet', 60),
  ('other', 'Other', 100)
on conflict (code) do update set name=excluded.name, sort_order=excluded.sort_order, active=true;

insert into public.laundry_services(code, name, workflow, sort_order) values
  ('wash_iron', 'Wash + Iron', 'wash_iron', 10),
  ('iron_only', 'Iron Only', 'iron_only', 20)
on conflict (code) do update set name=excluded.name, workflow=excluded.workflow, sort_order=excluded.sort_order, active=true;

-- Starter rates in AED.
insert into public.laundry_rates(garment_type_id, service_id, unit_price, effective_from)
select g.id, s.id,
  case
    when g.code='shirt' and s.code='wash_iron' then 8
    when g.code='shirt' and s.code='iron_only' then 4
    when g.code='trouser' and s.code='wash_iron' then 9
    when g.code='trouser' and s.code='iron_only' then 5
    when g.code='tshirt' and s.code='wash_iron' then 7
    when g.code='tshirt' and s.code='iron_only' then 4
    when g.code='dress' and s.code='wash_iron' then 16
    when g.code='dress' and s.code='iron_only' then 8
    when g.code='abaya' and s.code='wash_iron' then 15
    when g.code='abaya' and s.code='iron_only' then 8
    when g.code='bedsheet' and s.code='wash_iron' then 18
    when g.code='bedsheet' and s.code='iron_only' then 10
    when s.code='wash_iron' then 10
    else 5
  end::numeric,
  date '2026-01-01'
from public.laundry_garment_types g cross join public.laundry_services s
on conflict (garment_type_id, service_id, effective_from) do update set unit_price=excluded.unit_price, active=true;

insert into public.laundry_discounts(name, discount_type, value, active)
values ('No discount', 'fixed', 0, true), ('VIP 10%', 'percent', 10, true)
on conflict (name) do update set discount_type=excluded.discount_type, value=excluded.value, active=true;

insert into public.laundry_settings(key, value) values
  ('business', '{"name":"Laundry Desk Demo","currency":"AED","timezone":"Asia/Dubai","phone":"+971500000000"}'::jsonb),
  ('login_policy', '{"max_failed_attempts":5,"window_minutes":10,"session_hours":12}'::jsonb)
on conflict (key) do update set value=excluded.value, updated_at=now();

-- Seed a pickup request assigned to the demo driver.
insert into public.laundry_orders(customer_id, channel, laundry_status, pickup_driver_id, delivery_address, source_note, created_by_staff_id)
select c.id, 'pickup', 'pickup_requested', d.id, c.address, 'Demo WhatsApp pickup request', m.id
from public.laundry_customers c
cross join lateral (select id from public.laundry_staff where login_id='driver' limit 1) d
cross join lateral (select id from public.laundry_staff where login_id='manager' limit 1) m
where c.mobile='+971501234567'
  and not exists (select 1 from public.laundry_orders where source_note='Demo WhatsApp pickup request');
