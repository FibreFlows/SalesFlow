alter table if exists public.leads
  add column if not exists opportunity_scope text[] not null default '{}';
