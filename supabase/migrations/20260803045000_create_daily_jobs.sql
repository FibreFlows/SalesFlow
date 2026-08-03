create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  scheduled_date date not null,
  scheduled_time time,
  customer_name text,
  address text,
  specification text,
  notes text,
  status text not null default 'scheduled' check (status in ('scheduled', 'completed', 'cancelled')),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index jobs_owner_scheduled_date_idx on public.jobs(owner_id, scheduled_date);
create index jobs_owner_completed_at_idx on public.jobs(owner_id, completed_at);

alter table public.jobs enable row level security;

create policy "Owners manage jobs" on public.jobs
  for all to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);
