"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, Check, Plus } from "lucide-react";
import { AddressAutocomplete } from "@/components/address-autocomplete";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

type Job = { id: string; scheduled_date: string; scheduled_time: string | null; customer_name: string | null; address: string | null; specification: string | null; notes: string | null; status: "scheduled" | "completed" | "cancelled"; completed_at: string | null };
const today = () => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Edmonton", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
const empty = () => ({ scheduled_date: today(), scheduled_time: "", customer_name: "", address: "", specification: "", notes: "" });

export function JobsClient() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [form, setForm] = useState(empty);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const frame = requestAnimationFrame(async () => {
      const { data } = await createClient().from("jobs").select("*").order("scheduled_date", { ascending: false }).order("scheduled_time", { ascending: true });
      setJobs((data || []) as Job[]);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  async function addJob(event: FormEvent) {
    event.preventDefault();
    const supabase = createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) { setMessage("Please sign in through Leads first."); return; }
    const { data, error } = await supabase.from("jobs").insert({ owner_id: auth.user.id, ...form, scheduled_time: form.scheduled_time || null }).select().single();
    if (error) { setMessage(error.message); return; }
    setJobs((current) => [data as Job, ...current]); setForm(empty()); setMessage("Job added.");
  }

  async function complete(job: Job) {
    const completed_at = new Date().toISOString();
    const { error } = await createClient().from("jobs").update({ status: "completed", completed_at, updated_at: completed_at }).eq("id", job.id);
    if (error) { setMessage(error.message); return; }
    setJobs((current) => current.map((item) => item.id === job.id ? { ...item, status: "completed", completed_at } : item));
  }

  return <main className="min-h-screen bg-background p-5 text-foreground sm:p-8"><div className="mx-auto max-w-6xl"><Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground"><ArrowLeft className="size-4" /> Dashboard</Link><div className="mb-6"><Badge className="border-primary/30 bg-primary/10 text-primary">DAILY JOBS</Badge><h1 className="mt-3 text-3xl font-semibold">My installation schedule</h1><p className="mt-2 text-sm text-muted-foreground">These jobs are separate from sales and drive the dashboard’s jobs-done totals.</p></div><div className="grid gap-6 lg:grid-cols-[360px_1fr]"><Card><CardHeader><CardTitle>Add a job</CardTitle></CardHeader><CardContent><form className="space-y-3" onSubmit={addJob}><div className="grid grid-cols-2 gap-3"><Input type="date" value={form.scheduled_date} onChange={(e) => setForm({ ...form, scheduled_date: e.target.value })} /><Input type="time" value={form.scheduled_time} onChange={(e) => setForm({ ...form, scheduled_time: e.target.value })} /></div><Input placeholder="Customer name" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} /><AddressAutocomplete value={form.address} onChange={(address) => setForm((current) => ({ ...current, address }))} /><textarea className="min-h-24 w-full rounded-md border border-input bg-transparent p-3 text-sm" placeholder="Job specifications" value={form.specification} onChange={(e) => setForm({ ...form, specification: e.target.value })} /><textarea className="min-h-20 w-full rounded-md border border-input bg-transparent p-3 text-sm" placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />{message ? <p className="text-sm text-primary">{message}</p> : null}<Button className="w-full" type="submit"><Plus /> Add job</Button></form></CardContent></Card><Card><CardHeader><CardTitle>Schedule</CardTitle></CardHeader><CardContent className="space-y-3">{jobs.length === 0 ? <p className="py-12 text-center text-sm text-muted-foreground">No jobs scheduled yet.</p> : jobs.map((job) => <div key={job.id} className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center"><div className="min-w-32"><p className="font-medium">{job.scheduled_date}</p><p className="text-sm text-muted-foreground">{job.scheduled_time?.slice(0,5) || "Time not set"}</p></div><div className="flex-1"><p className="font-medium">{job.customer_name || "Unnamed customer"}</p><p className="text-sm text-muted-foreground">{job.address || "No address"}</p><p className="mt-1 text-sm">{job.specification || "No specifications"}</p></div>{job.status === "completed" ? <Badge className="bg-primary/10 text-primary">Completed</Badge> : <Button size="sm" onClick={() => complete(job)}><Check /> Mark done</Button>}</div>)}</CardContent></Card></div></div></main>;
}
