alter table public.leads
  add column possible_rgu_sale smallint check (possible_rgu_sale >= 0);
