alter table public.leads
  add column mobility_ban text;

create index leads_mobility_ban_idx on public.leads(mobility_ban) where mobility_ban is not null;
