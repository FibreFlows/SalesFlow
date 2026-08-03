"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Download, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

type Period = "daily" | "weekly" | "monthly" | "yearly";
type Profile = { full_name: string; tech_id: string; afl_email: string; telus_email: string };
type Job = { id: string; customer_name: string | null; scheduled_date: string; specification: string | null; status: string; sale_done_by_me: boolean | null; sale_converted_at: string | null; lead_data: { sale_scope?: string[] } | null };
type Lead = { id: string; first_name: string; last_name: string; company: string; status: string; possible_rgu_sale: number | null; sale_scope: string[]; created_at: string; converted_at: string | null };
const DEFAULT_PROFILE: Profile = { full_name: "Sahil Bhatia", tech_id: "X2002709", afl_email: "sahil.bhatia@aflglabal.com", telus_email: "sahil.bhatia1@telus.com" };

function periodStart(period: Period) {
  const date = new Date(); date.setHours(0, 0, 0, 0);
  if (period === "weekly") { const day = date.getDay() || 7; date.setDate(date.getDate() - day + 1); }
  if (period === "monthly") date.setDate(1);
  if (period === "yearly") { date.setMonth(0, 1); }
  return date;
}
const inPeriod = (value: string | null, start: Date) => Boolean(value && new Date(value).getTime() >= start.getTime());
const jobInPeriod = (value: string, start: Date) => new Date(`${value}T12:00:00`).getTime() >= start.getTime();
const ascii = (value: string) => value.normalize("NFKD").replace(/[^\x20-\x7E]/g, "-").replace(/([\\()])/g, "\\$1");

function downloadPdf(lines: string[], filename: string) {
  const chunks: string[][] = []; for (let i = 0; i < lines.length; i += 45) chunks.push(lines.slice(i, i + 45));
  const objects: string[] = []; const pageIds: number[] = []; const contentIds: number[] = [];
  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>"; objects[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
  chunks.forEach(() => { pageIds.push(objects.length || 4); objects.push(""); contentIds.push(objects.length); objects.push(""); });
  objects[2] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`;
  chunks.forEach((pageLines, index) => {
    const stream = `BT /F1 10 Tf 48 760 Td 14 TL ${pageLines.map((line, lineIndex) => `${lineIndex ? "T* " : ""}(${ascii(line)}) Tj`).join(" ")} ET`;
    objects[pageIds[index]] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentIds[index]} 0 R >>`;
    objects[contentIds[index]] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
  });
  let pdf = "%PDF-1.4\n"; const offsets = [0]; for (let id = 1; id < objects.length; id++) { offsets[id] = pdf.length; pdf += `${id} 0 obj\n${objects[id]}\nendobj\n`; }
  const xref = pdf.length; pdf += `xref\n0 ${objects.length}\n0000000000 65535 f \n`; for (let id = 1; id < objects.length; id++) pdf += `${String(offsets[id]).padStart(10, "0")} 00000 n \n`;
  pdf += `trailer << /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  const url = URL.createObjectURL(new Blob([pdf], { type: "application/pdf" })); const anchor = document.createElement("a"); anchor.href = url; anchor.download = filename; anchor.click(); URL.revokeObjectURL(url);
}

export function ReportsClient() {
  const [period, setPeriod] = useState<Period>("daily");
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  useEffect(() => { const load = async () => { const supabase = createClient(); const { data: auth } = await supabase.auth.getUser(); if (!auth.user) return; const [{ data: saved }, { data: jobRows }, { data: leadRows }] = await Promise.all([supabase.from("user_profiles").select("*").eq("user_id", auth.user.id).maybeSingle(), supabase.from("jobs").select("*"), supabase.from("leads").select("*")]); const metadata = auth.user.user_metadata as Partial<Profile>; const current = saved || { user_id: auth.user.id, ...DEFAULT_PROFILE, ...metadata }; setProfile(current as Profile); if (!saved) await supabase.from("user_profiles").upsert({ user_id: auth.user.id, ...DEFAULT_PROFILE, ...metadata, updated_at: new Date().toISOString() }); setJobs((jobRows || []) as Job[]); setLeads((leadRows || []) as Lead[]); }; const frame = requestAnimationFrame(load); const interval = window.setInterval(load, 15000); window.addEventListener("focus", load); return () => { cancelAnimationFrame(frame); window.clearInterval(interval); window.removeEventListener("focus", load); }; }, []);
  const report = useMemo(() => { const start = periodStart(period); const periodJobs = jobs.filter((job) => jobInPeriod(job.scheduled_date, start)); const leadSales = leads.filter((lead) => inPeriod(lead.converted_at, start)); const jobSales = jobs.filter((job) => inPeriod(job.sale_converted_at, start)); const possible = leads.filter((lead) => lead.status !== "converted" && lead.status !== "unqualified" && inPeriod(lead.created_at, start)); return { start, periodJobs, leadSales, jobSales, possible }; }, [period, jobs, leads]);
  const exportPdf = () => { const lines = ["SALESFLOW ACTIVITY REPORT", `${period.toUpperCase()} REPORT`, "", `Name: ${profile.full_name}`, `Tech ID: ${profile.tech_id}`, `AFL Email: ${profile.afl_email}`, `TELUS Email: ${profile.telus_email}`, `Period starting: ${report.start.toLocaleDateString()}`, `Generated: ${new Date().toLocaleString()}`, "", `Daily jobs: ${report.periodJobs.length}`, `Converted sales: ${report.leadSales.length + report.jobSales.length}`, `Possible leads: ${report.possible.length}`, "", "DAILY JOBS", ...report.periodJobs.map((job) => `${job.scheduled_date} | ${job.customer_name || "Unnamed customer"} | ${job.specification || "No specification"} | ${job.status}`), "", "CONVERTED SALES", ...report.leadSales.map((lead) => `${lead.converted_at?.slice(0, 10)} | ${lead.first_name} ${lead.last_name} | Sold: ${lead.sale_scope?.join(", ") || "Not specified"} | Add Lead`), ...report.jobSales.map((job) => `${job.sale_converted_at?.slice(0, 10)} | ${job.customer_name || "Unnamed customer"} | Sold: ${job.lead_data?.sale_scope?.join(", ") || "Not specified"} | Daily Job`), "", "NOT SOLD BUT POSSIBLE", ...report.possible.map((lead) => `${lead.first_name} ${lead.last_name} | Possible: ${lead.sale_scope?.join(", ") || "Not specified"} | RGU ${lead.possible_rgu_sale || 0}`)]; downloadPdf(lines, `salesflow-${period}-report-${new Date().toISOString().slice(0, 10)}.pdf`); };
  return <main className="min-h-screen bg-background p-5 text-foreground sm:p-8"><div className="mx-auto max-w-6xl"><Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground"><ArrowLeft className="size-4"/> Dashboard</Link><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><Badge className="border-primary/30 bg-primary/10 text-primary">LIVE CLOUD REPORTS</Badge><h1 className="mt-3 text-3xl font-semibold">Sales and workload reports</h1><p className="mt-2 text-sm text-muted-foreground">{profile.full_name} · {profile.tech_id} · {profile.afl_email} · {profile.telus_email}</p></div><Button onClick={exportPdf}><Download/> Download PDF</Button></div><div className="mt-6 flex flex-wrap gap-2">{(["daily","weekly","monthly","yearly"] as Period[]).map((item)=><Button key={item} variant={period===item?"default":"outline"} onClick={()=>setPeriod(item)} className="capitalize">{item}</Button>)}</div><section className="mt-6 grid gap-4 sm:grid-cols-3"><Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Daily jobs</p><p className="mt-2 text-3xl font-semibold">{report.periodJobs.length}</p></CardContent></Card><Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Converted sales</p><p className="mt-2 text-3xl font-semibold">{report.leadSales.length+report.jobSales.length}</p></CardContent></Card><Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Not sold but possible</p><p className="mt-2 text-3xl font-semibold">{report.possible.length}</p></CardContent></Card></section><Card className="mt-6"><CardHeader><CardTitle className="flex items-center gap-2"><FileText className="size-5"/> {period[0].toUpperCase()+period.slice(1)} details</CardTitle></CardHeader><CardContent className="space-y-5"><div><h2 className="font-medium">Daily jobs</h2>{report.periodJobs.length?<div className="mt-2 space-y-2">{report.periodJobs.map((job)=><div key={job.id} className="rounded-md border p-3 text-sm"><p className="font-medium">{job.customer_name||"Unnamed customer"}</p><p className="text-muted-foreground">{job.scheduled_date} · {job.specification||"No specification"} · {job.status}</p></div>)}</div>:<p className="mt-2 text-sm text-muted-foreground">No jobs in this period.</p>}</div><div><h2 className="font-medium">Converted sales</h2><p className="mt-2 text-sm text-muted-foreground">{report.leadSales.length+report.jobSales.length} sales converted in this period.</p></div><div><h2 className="font-medium">Not sold but possible</h2><p className="mt-2 text-sm text-muted-foreground">{report.possible.length} possible leads added in this period.</p></div></CardContent></Card></div></main>;
}
