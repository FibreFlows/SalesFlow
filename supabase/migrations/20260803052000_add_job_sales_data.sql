alter table public.jobs add column lead_data jsonb not null default '{}'::jsonb, add column sale_converted_at timestamptz;
update public.jobs set sale_converted_at = completed_at where sale_done_by_me is true and sale_converted_at is null;
create index jobs_owner_sale_converted_at_idx on public.jobs(owner_id, sale_converted_at);
