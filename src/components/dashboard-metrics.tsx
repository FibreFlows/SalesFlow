"use client";

import { CalendarCheck, CalendarDays, CheckCircle2, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

type MetricCounts = { monthSales: number; yearSales: number; monthJobs: number; lastMonthSales: number };

export function DashboardMetrics() {
  const [counts, setCounts] = useState<MetricCounts>({ monthSales: 0, yearSales: 0, monthJobs: 0, lastMonthSales: 0 });

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const [{ data: leads }, { data: jobs }] = await Promise.all([
        supabase.from("leads").select("converted_at"),
        supabase.from("jobs").select("status,completed_at,sale_converted_at"),
      ]);
      const now = new Date();
      const year = Number(new Intl.DateTimeFormat("en-CA", { timeZone: "America/Edmonton", year: "numeric" }).format(now));
      const month = Number(new Intl.DateTimeFormat("en-CA", { timeZone: "America/Edmonton", month: "numeric" }).format(now));
      const previous = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const previousYear = previous.getFullYear();
      const previousMonth = previous.getMonth() + 1;
      const parts = (value: string | null) => value ? {
        year: Number(new Intl.DateTimeFormat("en-CA", { timeZone: "America/Edmonton", year: "numeric" }).format(new Date(value))),
        month: Number(new Intl.DateTimeFormat("en-CA", { timeZone: "America/Edmonton", month: "numeric" }).format(new Date(value))),
      } : null;
      const rows = leads || [];
      const allJobs = jobs || [];
      const completedJobs = allJobs.filter((job) => job.status === "completed");
      setCounts({
        monthSales: rows.filter((row) => { const date = parts(row.converted_at); return date?.year === year && date.month === month; }).length + allJobs.filter((job) => { const date = parts(job.sale_converted_at); return date?.year === year && date.month === month; }).length,
        yearSales: rows.filter((row) => parts(row.converted_at)?.year === year).length + allJobs.filter((job) => parts(job.sale_converted_at)?.year === year).length,
        monthJobs: completedJobs.filter((job) => { const date = parts(job.completed_at); return date?.year === year && date.month === month; }).length,
        lastMonthSales: rows.filter((row) => { const date = parts(row.converted_at); return date?.year === previousYear && date.month === previousMonth; }).length + allJobs.filter((job) => { const date = parts(job.sale_converted_at); return date?.year === previousYear && date.month === previousMonth; }).length,
      });
    };
    const frame = requestAnimationFrame(load);
    const interval = window.setInterval(load, 15000);
    window.addEventListener("focus", load);
    return () => { cancelAnimationFrame(frame); window.clearInterval(interval); window.removeEventListener("focus", load); };
  }, []);

  const metrics = [
    { label: "Sales this month", value: counts.monthSales, icon: CalendarDays },
    { label: "Sales this year", value: counts.yearSales, icon: Target },
    { label: "Jobs done by me this month", value: counts.monthJobs, icon: CalendarCheck },
    { label: "Sales last month", value: counts.lastMonthSales, icon: CheckCircle2 },
  ];

  return <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(({ label, value, icon: Icon }) => <Card key={label}><CardContent className="p-5"><div className="mb-5 flex items-center justify-between"><p className="text-sm text-muted-foreground">{label}</p><Icon className="size-4 text-primary" /></div><p className="text-3xl font-semibold tracking-tight">{value}</p><p className="mt-2 text-xs text-primary">Live from your cloud records</p></CardContent></Card>)}</section>;
}
