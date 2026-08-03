create table public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  tech_id text not null default '',
  afl_email text not null default '',
  telus_email text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_profiles enable row level security;
grant select, insert, update on public.user_profiles to authenticated;

create policy "Users can read their profile" on public.user_profiles for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can create their profile" on public.user_profiles for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can update their profile" on public.user_profiles for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
