alter table public.leads
  add column referrer_ban text;

create index leads_referrer_ban_idx on public.leads(referrer_ban) where referrer_ban is not null;
