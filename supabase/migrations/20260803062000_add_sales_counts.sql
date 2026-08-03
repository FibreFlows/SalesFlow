alter table public.leads add column sales_count integer not null default 0 check (sales_count >= 0);
alter table public.jobs add column sales_count integer not null default 0 check (sales_count >= 0);
