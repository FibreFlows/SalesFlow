alter table public.jobs
  add column lead_id uuid references public.leads(id) on delete set null,
  add column sale_done_by_me boolean;

create index jobs_lead_id_idx on public.jobs(lead_id);
create index jobs_owner_sale_done_idx on public.jobs(owner_id, sale_done_by_me);
