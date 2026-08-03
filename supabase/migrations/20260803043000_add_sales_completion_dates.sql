alter table public.leads
  add column converted_at timestamptz,
  add column installation_completed_at timestamptz;

update public.leads set converted_at = updated_at where status = 'converted' and converted_at is null;
update public.leads set installation_completed_at = updated_at where installation_completed is true and installation_completed_at is null;

create index leads_owner_converted_at_idx on public.leads(owner_id, converted_at);
create index leads_owner_installation_completed_at_idx on public.leads(owner_id, installation_completed_at);
