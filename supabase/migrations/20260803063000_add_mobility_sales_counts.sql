alter table public.leads
  add column telus_sims_sold integer not null default 0 check (telus_sims_sold >= 0),
  add column koodo_sims_sold integer not null default 0 check (koodo_sims_sold >= 0);
alter table public.jobs
  add column telus_sims_sold integer not null default 0 check (telus_sims_sold >= 0),
  add column koodo_sims_sold integer not null default 0 check (koodo_sims_sold >= 0);
