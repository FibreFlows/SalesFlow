"use client";

import { ArrowDownRight, ArrowRight, ArrowUpRight, CalendarCheck, CalendarDays, CheckCircle2, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

type MetricCounts = { monthSales: number; yearSales: number; monthJobs: number; lastMonthSales: number };

export function DashboardMetrics() {
  const [counts, setCounts] = useState<MetricCounts>({ monthSales: 0, yearSales: 0, monthJobs: 0, lastMonthSales: 0 });

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const [{ data: leads }, { data: jobs }] = await Promise.all([
        supabase.from("leads").select("id,converted_at,sales_count"),
        supabase.from("jobs").select("lead_id,status,completed_at,sale_converted_at,sales_count"),
      ]);
      const now = new Date();
      const year = Number(new Intl.DateTimeFormat("en-CA", { timeZone: "America/Edmonton", year: "numeric" }).format(now));
      const month = Number(new Intl.DateTimeFormat("en-CA", { timeZone: "America/Edmonton", month: "numeric" }).format(now));
      const previous = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const previousYear = previous.getFullYear();
      const previousMonth = previous.getMonth() + 1;
      const parts = (value: string | null) => value ? { year: Number(new Intl.DateTimeFormat("en-CA", { timeZone: "America/Edmonton", year: "numeric" }).format(new Date(value))), month: Number(new Intl.DateTimeFormat("en-CA", { timeZone: "America/Edmonton", month: "numeric" }).format(new Date(value))) } : null;
      const linkedLeadIds = new Set((jobs || []).filter((job) => job.sale_converted_at).map((job) => job.lead_id).filter(Boolean));
      const rows = (leads || []).filter((lead) => !linkedLeadIds.has(lead.id));
      const allJobs = jobs || [];
      const completedJobs = allJobs.filter((job) => job.status === "completed");
      const units = (row: { sales_count?: number | null }) => Math.max(Number(row.sales_count || 0), 1);
      setCounts({
        monthSales: rows.filter((row) => { const date = parts(row.converted_at); return date?.year === year && date.month === month; }).reduce((sum, row) => sum + units(row), 0) + allJobs.filter((job) => { const date = parts(job.sale_converted_at); return date?.year === year && date.month === month; }).reduce((sum, job) => sum + units(job), 0),
        yearSales: rows.filter((row) => parts(row.converted_at)?.year === year).reduce((sum, row) => sum + units(row), 0) + allJobs.filter((job) => parts(job.sale_converted_at)?.year === year).reduce((sum, job) => sum + units(job), 0),
        monthJobs: completedJobs.filter((job) => { const date = parts(job.completed_at); return date?.year === year && date.month === month; }).length,
        lastMonthSales: rows.filter((row) => { const date = parts(row.converted_at); return date?.year === previousYear && date.month === previousMonth; }).reduce((sum, row) => sum + units(row), 0) + allJobs.filter((job) => { const date = parts(job.sale_converted_at); return date?.year === previousYear && date.month === previousMonth; }).reduce((sum, job) => sum + units(job), 0),
      });
    };
    const frame = requestAnimationFrame(load);
    const interval = window.setInterval(load, 15000);
    window.addEventListener("focus", load);
    return () => { cancelAnimationFrame(frame); window.clearInterval(interval); window.removeEventListener("focus", load); };
  }, []);

  const delta = counts.monthSales - counts.lastMonthSales;
  const DeltaIcon = delta > 0 ? ArrowUpRight : delta < 0 ? ArrowDownRight : ArrowRight;
  const metrics = [
    { label: "Sales this month", value: counts.monthSales, icon: CalendarDays, note: `${delta > 0 ? "+" : ""}${delta} vs last month`, noteIcon: DeltaIcon },
    { label: "Sales this year", value: counts.yearSales, icon: Target, note: "Year to date" },
    { label: "Jobs this month", value: counts.monthJobs, icon: CalendarCheck, note: "Completed by me" },
    { label: "Sales last month", value: counts.lastMonthSales, icon: CheckCircle2, note: "Previous month" },
  ];

  return <Card className="dashboard-metrics overflow-hidden rounded-[20px]"><div className="metric-strip flex gap-2 overflow-x-auto p-2.5 md:grid md:grid-cols-4 md:overflow-visible">{metrics.map(({ label, value, icon: Icon, note, noteIcon: NoteIcon }) => <div key={label} className="flex min-w-[148px] flex-1 items-center gap-3 rounded-xl bg-muted/65 px-3 py-3 md:min-w-0"><span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><Icon className="size-4" /></span><div className="min-w-0 flex-1"><p className="truncate text-[11px] text-muted-foreground">{label}</p><div className="flex items-end justify-between gap-2"><p className="text-xl font-bold leading-6">{value}</p><p className={`flex items-center whitespace-nowrap text-[9px] ${label === "Sales this month" && delta > 0 ? "text-primary" : "text-muted-foreground"}`}>{NoteIcon ? <NoteIcon className="mr-0.5 size-3" /> : null}{note}</p></div></div></div>)}</div></Card>;
}
