create table if not exists public.offer_plans (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text not null default 'Offer',
  price text not null default '',
  summary text not null default '',
  source_file text not null default '',
  details jsonb not null default '{}'::jsonb,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.offer_plans enable row level security;
grant select, insert, update, delete on public.offer_plans to authenticated;
create policy "Users can read their offer plans" on public.offer_plans for select to authenticated using ((select auth.uid()) = owner_id);
create policy "Users can create their offer plans" on public.offer_plans for insert to authenticated with check ((select auth.uid()) = owner_id);
create policy "Users can update their offer plans" on public.offer_plans for update to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy "Users can delete their offer plans" on public.offer_plans for delete to authenticated using ((select auth.uid()) = owner_id);
create index if not exists offer_plans_owner_featured_idx on public.offer_plans(owner_id, featured, updated_at desc);
