"use client";

import { ArrowRight, BriefcaseBusiness, CalendarCheck2, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Job = { id: string; scheduled_date: string; scheduled_time: string | null; status: string; customer_name: string | null; address: string | null };

export function MobileDashboardHero() {
  const [jobs, setJobs] = useState<Job[]>([]);
  useEffect(() => {
    const load = async () => {
      const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Edmonton" }).format(new Date());
      const { data } = await createClient().from("jobs").select("id,scheduled_date,scheduled_time,status,customer_name,address").eq("scheduled_date", today).order("scheduled_time");
      setJobs((data || []) as Job[]);
    };
    const frame = requestAnimationFrame(load);
    return () => cancelAnimationFrame(frame);
  }, []);
  const completed = jobs.filter((job) => job.status === "completed").length;
  const next = jobs.find((job) => job.status !== "completed");
  const name = next?.customer_name || "Your schedule is clear";
  const time = next?.scheduled_time ? new Intl.DateTimeFormat("en-CA", { hour: "numeric", minute: "2-digit" }).format(new Date(`2000-01-01T${next.scheduled_time}`)) : "No next job";

  return <section className="mobile-command-card overflow-hidden rounded-[26px] border border-primary/15 bg-card shadow-[0_12px_36px_rgba(20,80,45,.10)]">
    <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
      <div>
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.12em] text-primary"><BriefcaseBusiness className="size-4" /> Today&apos;s workload</p>
        <p className="mt-3 text-3xl font-semibold tracking-tight">{jobs.length} {jobs.length === 1 ? "job" : "jobs"} scheduled</p>
        <div className="mt-5 flex items-center gap-4"><div className="grid size-16 place-items-center rounded-full border-[7px] border-primary/20 text-lg font-bold text-primary">{jobs.length ? Math.round((completed / jobs.length) * 100) : 0}%</div><div><p className="text-xl font-semibold">{completed} / {jobs.length}</p><p className="text-sm text-muted-foreground">jobs completed</p></div></div>
      </div>
      <div className="rounded-2xl bg-primary/10 p-4">
        <p className="text-xs font-semibold uppercase tracking-[.12em] text-muted-foreground">Next appointment</p>
        <p className="mt-2 text-sm font-semibold text-primary">{time}</p><p className="mt-1 text-lg font-semibold">{name}</p>
        <p className="mt-2 flex items-start gap-1.5 text-xs leading-5 text-muted-foreground"><MapPin className="mt-0.5 size-3.5 shrink-0" />{next?.address || "No address added"}</p>
        <a href="/jobs" className="mt-4 flex min-h-11 items-center justify-between rounded-xl border border-primary/25 bg-background px-4 text-sm font-semibold text-primary">View workload <ArrowRight className="size-4" /></a>
      </div>
    </div>
    <div className="flex items-center gap-2 border-t border-border bg-primary/5 px-5 py-3 text-xs text-muted-foreground"><CalendarCheck2 className="size-4 text-primary" /> Live from your cloud workload</div>
  </section>;
}
