-- Laundry Desk v1.4.0 — mixed-service collection + customer wallet
-- Applied live on 2026-11-23. This file is retained for source control/rebuilds.

alter table public.laundry_services drop constraint if exists laundry_services_workflow_check;
alter table public.laundry_services add constraint laundry_services_workflow_check
check (workflow = any (array['wash_iron'::text,'wash_only'::text,'iron_only'::text,'dry_clean'::text,'custom'::text]));

alter table public.laundry_orders drop constraint if exists laundry_orders_laundry_status_check;
alter table public.laundry_orders add constraint laundry_orders_laundry_status_check
check (laundry_status = any (array['pickup_requested'::text,'collected'::text,'received'::text,'processing'::text,'washing'::text,'ironing'::text,'ready'::text,'out_for_delivery'::text,'delivered'::text]));

alter table public.laundry_credit_ledger
  add column if not exists method text,
  add column if not exists collected_by_staff_id uuid references public.laundry_staff(id),
  add column if not exists reference_no text;

alter table public.laundry_credit_ledger drop constraint if exists laundry_credit_ledger_entry_type_check;
alter table public.laundry_credit_ledger add constraint laundry_credit_ledger_entry_type_check
check (entry_type = any (array['overpayment'::text,'application'::text,'adjustment'::text,'advance'::text]));

alter table public.laundry_credit_ledger drop constraint if exists laundry_credit_ledger_method_check;
alter table public.laundry_credit_ledger add constraint laundry_credit_ledger_method_check
check (method is null or method = any (array['cash'::text,'card'::text,'bank'::text,'other'::text,'credit'::text]));

create index if not exists laundry_credit_collector_idx
on public.laundry_credit_ledger(collected_by_staff_id,created_at desc);

-- Function bodies are deployed in the project and mirrored in the full source package.
-- Required functions:
--   laundry_record_payment_tx
--   laundry_apply_credit_tx
--   laundry_record_customer_payment_tx

insert into public.laundry_services(code,name,workflow,active,sort_order) values
('wash_only','Wash Only','wash_only',true,5),
('wash_iron','Wash + Iron','wash_iron',true,10),
('iron_only','Iron Only','iron_only',true,20),
('dry_clean','Dry Clean','dry_clean',true,30)
on conflict (code) do update set name=excluded.name,workflow=excluded.workflow,active=true,sort_order=excluded.sort_order;
