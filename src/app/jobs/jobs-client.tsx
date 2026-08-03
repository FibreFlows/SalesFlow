"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

type Lead = { id: string; first_name: string; last_name: string; company: string; email: string; phone: string; secondary_phone: string; address: string; ncid: string; ecid: string; ban: string; mobility_ban: string; referrer_ban: string; current_services: string[]; sale_scope: string[]; customer_rating: number | null; possible_rgu_sale: number | null };
type Job = { id: string; lead_id: string | null; scheduled_date: string; scheduled_time: string | null; customer_name: string | null; address: string | null; specification: string | null; notes: string | null; sale_done_by_me: boolean | null; status: "scheduled" | "completed" | "cancelled"; completed_at: string | null };
const today = () => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Edmonton", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
const empty = () => ({ lead_id: "", scheduled_date: today(), scheduled_time: "", specification: "", notes: "", sale_done_by_me: "" });

export function JobsClient() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [form, setForm] = useState(empty);
  const [message, setMessage] = useState("");
  const selectedLead = leads.find((lead) => lead.id === form.lead_id);

  useEffect(() => {
    const frame = requestAnimationFrame(async () => {
      const supabase = createClient();
      const [{ data: jobRows }, { data: leadRows }] = await Promise.all([supabase.from("jobs").select("*").order("scheduled_date", { ascending: false }).order("scheduled_time", { ascending: true }), supabase.from("leads").select("*").order("created_at", { ascending: false })]);
      setJobs((jobRows || []) as Job[]); setLeads((leadRows || []) as Lead[]);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const sections = useMemo(() => [{ title: "Previous sale: Yes", jobs: jobs.filter((job) => job.sale_done_by_me === true) }, { title: "Previous sale: No or unknown", jobs: jobs.filter((job) => job.sale_done_by_me !== true) }], [jobs]);
  const leadForJob = (job: Job) => leads.find((lead) => lead.id === job.lead_id);

  async function addJob(event: FormEvent) {
    event.preventDefault();
    const supabase = createClient(); const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) { setMessage("Please sign in through Leads first."); return; }
    if (!selectedLead) { setMessage("Select a sales lead for this job."); return; }
    const payload = { owner_id: auth.user.id, lead_id: selectedLead.id, customer_name: `${selectedLead.first_name} ${selectedLead.last_name}`.trim(), address: selectedLead.address, scheduled_date: form.scheduled_date, scheduled_time: form.scheduled_time || null, specification: form.specification, notes: form.notes, sale_done_by_me: form.sale_done_by_me === "" ? null : form.sale_done_by_me === "yes" };
    const { data, error } = await supabase.from("jobs").insert(payload).select().single();
    if (error) { setMessage(error.message); return; }
    setJobs((current) => [data as Job, ...current]); setForm(empty()); setMessage("Job added.");
  }

  async function complete(job: Job) {
    const completed_at = new Date().toISOString();
    const { error } = await createClient().from("jobs").update({ status: "completed", completed_at, updated_at: completed_at }).eq("id", job.id);
    if (error) { setMessage(error.message); return; }
    setJobs((current) => current.map((item) => item.id === job.id ? { ...item, status: "completed", completed_at } : item));
  }

  return <main className="min-h-screen bg-background p-5 text-foreground sm:p-8"><div className="mx-auto max-w-6xl"><Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground"><ArrowLeft className="size-4" /> Dashboard</Link><div className="mb-6"><Badge className="border-primary/30 bg-primary/10 text-primary">DAILY JOBS</Badge><h1 className="mt-3 text-3xl font-semibold">My installation schedule</h1><p className="mt-2 text-sm text-muted-foreground">Every job is linked to a Sales Lead. Job completion and sale ownership are tracked separately.</p></div><div className="grid gap-6 lg:grid-cols-[380px_1fr]"><Card><CardHeader><CardTitle>Add a job from a sales lead</CardTitle></CardHeader><CardContent><form className="space-y-3" onSubmit={addJob}><select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.lead_id} onChange={(e) => setForm({ ...form, lead_id: e.target.value })}><option value="">Select sales lead...</option>{leads.map((lead) => <option key={lead.id} value={lead.id}>{`${lead.first_name} ${lead.last_name}`.trim() || lead.company || lead.address || "Unnamed lead"}</option>)}</select>{selectedLead ? <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs"><p className="font-medium text-foreground">{selectedLead.email || selectedLead.phone || "No contact information"}</p><p className="mt-1">{selectedLead.address || "No address"}</p><p className="mt-2">NCID {selectedLead.ncid || "—"} · ECID {selectedLead.ecid || "—"}</p><p>HS BAN {selectedLead.ban || "—"} · Mob BAN {selectedLead.mobility_ban || "—"} · Referrer BAN {selectedLead.referrer_ban || "—"}</p><p className="mt-2">Current: {selectedLead.current_services?.join(", ") || "None listed"}</p><p>Sale scope: {selectedLead.sale_scope?.join(", ") || "None listed"}</p><p>Rating: {selectedLead.customer_rating || "Not rated"} · Possible RGU: {selectedLead.possible_rgu_sale || "Not set"}</p></div> : null}<div className="grid grid-cols-2 gap-3"><Input type="date" value={form.scheduled_date} onChange={(e) => setForm({ ...form, scheduled_date: e.target.value })} /><Input type="time" value={form.scheduled_time} onChange={(e) => setForm({ ...form, scheduled_time: e.target.value })} /></div><label className="block text-xs text-muted-foreground">Have I ever made a sale to this customer?<select className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground" value={form.sale_done_by_me} onChange={(e) => setForm({ ...form, sale_done_by_me: e.target.value })}><option value="">Not specified</option><option value="yes">Yes</option><option value="no">No</option></select></label><textarea className="min-h-24 w-full rounded-md border border-input bg-transparent p-3 text-sm" placeholder="Job specifications" value={form.specification} onChange={(e) => setForm({ ...form, specification: e.target.value })} /><textarea className="min-h-20 w-full rounded-md border border-input bg-transparent p-3 text-sm" placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />{message ? <p className="text-sm text-primary">{message}</p> : null}<Button className="w-full" type="submit"><Plus /> Add job</Button></form></CardContent></Card><div className="space-y-6">{sections.map((section) => <Card key={section.title}><CardHeader><CardTitle>{section.title}</CardTitle></CardHeader><CardContent className="space-y-3">{section.jobs.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">No records in this section.</p> : section.jobs.map((job) => { const lead = leadForJob(job); return <div key={job.id} className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center"><div className="min-w-32"><p className="font-medium">{job.scheduled_date}</p><p className="text-sm text-muted-foreground">{job.scheduled_time?.slice(0,5) || "Time not set"}</p></div><div className="min-w-0 flex-1"><p className="font-medium">{job.customer_name || "Unnamed customer"}</p><p className="break-words text-sm text-muted-foreground">{job.address || "No address"}</p><p className="mt-1 text-sm">{job.specification || "No specifications"}</p>{lead ? <p className="mt-1 text-xs text-muted-foreground">Scope: {lead.sale_scope?.join(", ") || "Not listed"} · RGU: {lead.possible_rgu_sale || "—"}</p> : null}</div>{job.status === "completed" ? <Badge className="bg-primary/10 text-primary">Completed</Badge> : <Button size="sm" onClick={() => complete(job)}><Check /> Mark done</Button>}</div>; })}</CardContent></Card>)}</div></div></div></main>;
}
