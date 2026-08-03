alter table public.leads
  add column ncid text,
  add column ecid text,
  add column ban text,
  add column secondary_phone text,
  add column address text,
  add column preferred_contact_method text,
  add column best_contact_time text,
  add column current_services text[] not null default '{}',
  add column sale_scope text[] not null default '{}',
  add column is_with_competitor boolean not null default false,
  add column competitor_name text,
  add column is_in_contract boolean not null default false,
  add column contract_expiry_date date,
  add column current_monthly_cost numeric(10,2) check (current_monthly_cost >= 0),
  add column customer_rating smallint check (customer_rating between 1 and 5),
  add column last_contacted_at timestamptz,
  add column next_follow_up_at timestamptz,
  add column assigned_salesperson text;

create index leads_ncid_idx on public.leads(ncid) where ncid is not null;
create index leads_ecid_idx on public.leads(ecid) where ecid is not null;
create index leads_ban_idx on public.leads(ban) where ban is not null;
create index leads_follow_up_idx on public.leads(owner_id, next_follow_up_at);
