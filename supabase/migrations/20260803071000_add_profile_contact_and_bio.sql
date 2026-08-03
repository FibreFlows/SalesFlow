alter table if exists public.user_profiles
  add column if not exists contact_number text not null default '',
  add column if not exists bio text not null default '';
