"use client";

import { BarChart3, Trophy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

type Period = "daily" | "weekly" | "monthly" | "yearly";
type Lead = { id: string; converted_at: string | null; sale_scope: string[]; telus_sims_sold: number; koodo_sims_sold: number };
type Job = { id: string; lead_id: string | null; sale_converted_at: string | null; lead_data: { sale_scope?: string[] } | null; telus_sims_sold: number; koodo_sims_sold: number };

function start(period: Period) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  if (period === "weekly") { const day = date.getDay() || 7; date.setDate(date.getDate() - day + 1); }
  if (period === "monthly") date.setDate(1);
  if (period === "yearly") date.setMonth(0, 1);
  return date.getTime();
}

export function ProductSalesTracker() {
  const [period, setPeriod] = useState<Period>("monthly");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const [{ data: leadRows }, { data: jobRows }] = await Promise.all([
        supabase.from("leads").select("id,converted_at,sale_scope,telus_sims_sold,koodo_sims_sold"),
        supabase.from("jobs").select("id,lead_id,sale_converted_at,lead_data,telus_sims_sold,koodo_sims_sold"),
      ]);
      setLeads((leadRows || []) as Lead[]);
      setJobs((jobRows || []) as Job[]);
    };
    const frame = requestAnimationFrame(load);
    const interval = window.setInterval(load, 15000);
    return () => { cancelAnimationFrame(frame); window.clearInterval(interval); };
  }, []);

  const totals = useMemo(() => {
    const since = start(period);
    const convertedJobs = jobs.filter((job) => job.sale_converted_at && new Date(job.sale_converted_at).getTime() >= since);
    const linked = new Set(convertedJobs.map((job) => job.lead_id).filter(Boolean));
    const convertedLeads = leads.filter((lead) => lead.converted_at && new Date(lead.converted_at).getTime() >= since && !linked.has(lead.id));
    const rows = [
      ...convertedLeads.map((lead) => ({ scope: lead.sale_scope || [], telus: lead.telus_sims_sold || 0, koodo: lead.koodo_sims_sold || 0 })),
      ...convertedJobs.map((job) => ({ scope: job.lead_data?.sale_scope || [], telus: job.telus_sims_sold || 0, koodo: job.koodo_sims_sold || 0 })),
    ];
    const count = (names: string[]) => rows.filter((row) => names.some((name) => row.scope.includes(name))).length;
    return [
      { label: "Wi-Fi", value: count(["Fibre internet", "Copper internet"]) },
      { label: "Optik TV", value: count(["Optik TV"]) },
      { label: "Security", value: count(["Security"]) },
      { label: "Home Phone", value: count(["Home phone"]) },
      { label: "TELUS Mobility", value: rows.reduce((sum, row) => sum + row.telus, 0) },
      { label: "Koodo Mobility", value: rows.reduce((sum, row) => sum + row.koodo, 0) },
    ];
  }, [period, leads, jobs]);

  const totalUnits = totals.reduce((sum, item) => sum + item.value, 0);
  const leader = totals.reduce((best, item) => item.value > best.value ? item : best, totals[0]);

  return <Card className="mt-4 overflow-hidden rounded-[20px] sm:mt-5">
    <div className="flex items-center gap-3 border-b border-border px-3 py-3 sm:px-4">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><BarChart3 className="size-[18px]" /></span>
      <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">Product sales</p><p className="truncate text-[11px] text-muted-foreground">{totalUnits} total RGUs · {totalUnits ? `${leader.label} leads` : "No sales yet"}</p></div>
      <select aria-label="Sales period" className="h-8 shrink-0 rounded-xl border border-input bg-background px-2 text-xs capitalize" value={period} onChange={(event) => setPeriod(event.target.value as Period)}>{(["daily", "weekly", "monthly", "yearly"] as Period[]).map((item) => <option key={item} value={item}>{item}</option>)}</select>
    </div>
    <CardContent className="p-2.5 sm:p-3"><div className="product-strip flex gap-2 overflow-x-auto md:grid md:grid-cols-6 md:overflow-visible">{totals.map((item) => <div key={item.label} className="flex min-w-[104px] flex-1 items-center justify-between gap-2 rounded-xl bg-muted/65 px-3 py-2.5 md:min-w-0"><div className="min-w-0"><p className="truncate text-[10px] leading-4 text-muted-foreground">{item.label}</p><p className="text-lg font-bold leading-5">{item.value}</p></div>{item.value === leader.value && item.value > 0 ? <Trophy className="size-3.5 shrink-0 text-amber-500" /> : null}</div>)}</div></CardContent>
  </Card>;
}
