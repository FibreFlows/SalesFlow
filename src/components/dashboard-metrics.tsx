"use client";

import { CalendarCheck, CalendarDays, CheckCircle2, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

type MetricCounts = { julySales: number; yearSales: number; monthJobs: number; yearJobs: number };

export function DashboardMetrics() {
  const [counts, setCounts] = useState<MetricCounts>({ julySales: 0, yearSales: 0, monthJobs: 0, yearJobs: 0 });

  useEffect(() => {
    const frame = requestAnimationFrame(async () => {
      const { data } = await createClient().from("leads").select("converted_at,installation_completed_at");
      const now = new Date();
      const year = Number(new Intl.DateTimeFormat("en-CA", { timeZone: "America/Edmonton", year: "numeric" }).format(now));
      const month = Number(new Intl.DateTimeFormat("en-CA", { timeZone: "America/Edmonton", month: "numeric" }).format(now));
      const parts = (value: string | null) => value ? {
        year: Number(new Intl.DateTimeFormat("en-CA", { timeZone: "America/Edmonton", year: "numeric" }).format(new Date(value))),
        month: Number(new Intl.DateTimeFormat("en-CA", { timeZone: "America/Edmonton", month: "numeric" }).format(new Date(value))),
      } : null;
      const rows = data || [];
      setCounts({
        julySales: rows.filter((row) => { const date = parts(row.converted_at); return date?.year === year && date.month === 7; }).length,
        yearSales: rows.filter((row) => parts(row.converted_at)?.year === year).length,
        monthJobs: rows.filter((row) => { const date = parts(row.installation_completed_at); return date?.year === year && date.month === month; }).length,
        yearJobs: rows.filter((row) => parts(row.installation_completed_at)?.year === year).length,
      });
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const metrics = [
    { label: "Sales in July", value: counts.julySales, icon: CalendarDays },
    { label: "Sales this year", value: counts.yearSales, icon: Target },
    { label: "Jobs done by me this month", value: counts.monthJobs, icon: CalendarCheck },
    { label: "Jobs done by me this year", value: counts.yearJobs, icon: CheckCircle2 },
  ];

  return <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(({ label, value, icon: Icon }) => <Card key={label}><CardContent className="p-5"><div className="mb-5 flex items-center justify-between"><p className="text-sm text-muted-foreground">{label}</p><Icon className="size-4 text-primary" /></div><p className="text-3xl font-semibold tracking-tight">{value}</p><p className="mt-2 text-xs text-primary">Live from your cloud records</p></CardContent></Card>)}</section>;
}
