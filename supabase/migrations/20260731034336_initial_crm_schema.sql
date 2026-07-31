create extension if not exists pgcrypto;

create type public.lead_status as enum ('new', 'contacted', 'qualified', 'unqualified', 'converted');
create type public.opportunity_stage as enum ('discovery', 'qualified', 'proposal', 'negotiation', 'won', 'lost');
create type public.activity_type as enum ('call', 'email', 'meeting', 'note', 'task');

create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  website text,
  industry text,
  phone text,
  address jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid references public.accounts(id) on delete set null,
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  job_title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  company text,
  email text,
  phone text,
  source text,
  status public.lead_status not null default 'new',
  estimated_value numeric(12,2) not null default 0 check (estimated_value >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.opportunities (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid references public.accounts(id) on delete set null,
  primary_contact_id uuid references public.contacts(id) on delete set null,
  name text not null,
  stage public.opportunity_stage not null default 'discovery',
  value numeric(12,2) not null default 0 check (value >= 0),
  probability smallint not null default 10 check (probability between 0 and 100),
  expected_close_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete cascade,
  opportunity_id uuid references public.opportunities(id) on delete cascade,
  type public.activity_type not null,
  subject text not null,
  description text,
  due_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint activity_has_parent check (
    lead_id is not null or contact_id is not null or opportunity_id is not null
  )
);

create index accounts_owner_id_idx on public.accounts(owner_id);
create index contacts_owner_id_idx on public.contacts(owner_id);
create index contacts_account_id_idx on public.contacts(account_id);
create index leads_owner_status_idx on public.leads(owner_id, status);
create index opportunities_owner_stage_idx on public.opportunities(owner_id, stage);
create index activities_owner_due_at_idx on public.activities(owner_id, due_at);

alter table public.accounts enable row level security;
alter table public.contacts enable row level security;
alter table public.leads enable row level security;
alter table public.opportunities enable row level security;
alter table public.activities enable row level security;

create policy "Owners manage accounts" on public.accounts
  for all to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);
create policy "Owners manage contacts" on public.contacts
  for all to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);
create policy "Owners manage leads" on public.leads
  for all to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);
create policy "Owners manage opportunities" on public.opportunities
  for all to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);
create policy "Owners manage activities" on public.activities
  for all to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);
