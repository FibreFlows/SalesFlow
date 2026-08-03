"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Download, FileJson, Pencil, Plus, Search, Trash2, Upload } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type LeadStatus = "new" | "contacted" | "qualified" | "unqualified" | "converted";
type Lead = {
  id: string;
  first_name: string;
  last_name: string;
  company: string;
  email: string;
  phone: string;
  source: string;
  status: LeadStatus;
  estimated_value: number;
  notes: string;
  created_at: string;
  updated_at: string;
};

const STORAGE_KEY = "salesflow.pilot.leads.v1";
const EMPTY_FORM = { first_name: "", last_name: "", company: "", email: "", phone: "", source: "", status: "new" as LeadStatus, estimated_value: "", notes: "" };

function downloadFile(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}

function csvCell(value: string | number) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

export function PilotClient() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [ready, setReady] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setLeads(JSON.parse(stored) as Lead[]);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
  }, [leads, ready]);

  const filteredLeads = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return leads;
    return leads.filter((lead) => [lead.first_name, lead.last_name, lead.company, lead.email, lead.phone].some((value) => value.toLowerCase().includes(needle)));
  }, [leads, query]);

  function submitLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const now = new Date().toISOString();
    if (editingId) {
      setLeads((current) => current.map((lead) => lead.id === editingId ? { ...lead, ...form, estimated_value: Number(form.estimated_value || 0), updated_at: now } : lead));
    } else {
      setLeads((current) => [{ id: crypto.randomUUID(), ...form, estimated_value: Number(form.estimated_value || 0), created_at: now, updated_at: now }, ...current]);
    }
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  function editLead(lead: Lead) {
    setEditingId(lead.id);
    setForm({ first_name: lead.first_name, last_name: lead.last_name, company: lead.company, email: lead.email, phone: lead.phone, source: lead.source, status: lead.status, estimated_value: String(lead.estimated_value), notes: lead.notes });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function exportJson() {
    downloadFile(`salesflow-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify({ format: "salesflow-leads", version: 1, exported_at: new Date().toISOString(), leads }, null, 2), "application/json");
  }

  function exportCsv() {
    const fields: (keyof Lead)[] = ["id", "first_name", "last_name", "company", "email", "phone", "source", "status", "estimated_value", "notes", "created_at", "updated_at"];
    const rows = [fields.join(","), ...leads.map((lead) => fields.map((field) => csvCell(lead[field])).join(","))];
    downloadFile(`salesflow-leads-${new Date().toISOString().slice(0, 10)}.csv`, rows.join("\r\n"), "text/csv;charset=utf-8");
  }

  async function importJson(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const payload = JSON.parse(await file.text()) as { format?: string; version?: number; leads?: Lead[] };
    if (payload.format !== "salesflow-leads" || payload.version !== 1 || !Array.isArray(payload.leads)) throw new Error("This is not a valid SalesFlow backup.");
    setLeads(payload.leads);
    event.target.value = "";
  }

  return (
    <main className="min-h-screen bg-background p-5 text-foreground sm:p-8">
      <div className="mx-auto max-w-7xl">
        <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Dashboard</Link>
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div><Badge className="border-primary/30 bg-primary/10 text-primary">PILOT v0.2</Badge><h1 className="mt-3 text-3xl font-semibold tracking-tight">Portable lead workspace</h1><p className="mt-2 text-sm text-muted-foreground">Records stay in this browser. Export a JSON backup regularly for safe migration to Supabase.</p></div>
          <div className="flex flex-wrap gap-2"><Button variant="outline" onClick={exportCsv}><Download /> CSV</Button><Button variant="outline" onClick={exportJson}><FileJson /> Backup</Button><Button variant="outline" onClick={() => fileRef.current?.click()}><Upload /> Restore</Button><input ref={fileRef} className="hidden" type="file" accept="application/json" onChange={importJson} /></div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
          <Card>
            <CardHeader><CardTitle>{editingId ? "Edit lead" : "Add a lead"}</CardTitle></CardHeader>
            <CardContent>
              <form className="space-y-3" onSubmit={submitLead}>
                <div className="grid grid-cols-2 gap-3"><Input required aria-label="First name" placeholder="First name" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} /><Input required aria-label="Last name" placeholder="Last name" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} /></div>
                <Input aria-label="Company" placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
                <Input type="email" aria-label="Email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <Input aria-label="Phone" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                <div className="grid grid-cols-2 gap-3"><Input aria-label="Source" placeholder="Source" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} /><Input type="number" min="0" step="0.01" aria-label="Estimated value" placeholder="Value" value={form.estimated_value} onChange={(e) => setForm({ ...form, estimated_value: e.target.value })} /></div>
                <select aria-label="Lead status" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as LeadStatus })}><option value="new">New</option><option value="contacted">Contacted</option><option value="qualified">Qualified</option><option value="unqualified">Unqualified</option><option value="converted">Converted</option></select>
                <textarea aria-label="Notes" className="min-h-24 w-full rounded-md border border-input bg-transparent p-3 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                <div className="flex gap-2"><Button className="flex-1" type="submit"><Plus /> {editingId ? "Save changes" : "Add lead"}</Button>{editingId ? <Button type="button" variant="ghost" onClick={() => { setEditingId(null); setForm(EMPTY_FORM); }}>Cancel</Button> : null}</div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between"><div><CardTitle>Leads</CardTitle><p className="mt-1 text-sm text-muted-foreground">{leads.length} saved record{leads.length === 1 ? "" : "s"}</p></div><div className="relative sm:w-72"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" placeholder="Search leads..." value={query} onChange={(e) => setQuery(e.target.value)} /></div></CardHeader>
            <CardContent>
              {!ready ? <p className="py-12 text-center text-sm text-muted-foreground">Loading your records...</p> : filteredLeads.length === 0 ? <div className="py-14 text-center"><p className="font-medium">No leads found</p><p className="mt-2 text-sm text-muted-foreground">Add your first lead using the form.</p></div> : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b border-border text-xs text-muted-foreground"><tr><th className="pb-3 font-medium">Lead</th><th className="pb-3 font-medium">Status</th><th className="pb-3 font-medium">Value</th><th className="pb-3 text-right font-medium">Actions</th></tr></thead><tbody>{filteredLeads.map((lead) => <tr key={lead.id} className="border-b border-border/60 last:border-0"><td className="py-4"><p className="font-medium">{lead.first_name} {lead.last_name}</p><p className="mt-1 text-xs text-muted-foreground">{lead.company || lead.email || lead.phone || "No company or contact"}</p></td><td className="py-4"><Badge className="border-primary/20 bg-primary/10 capitalize text-primary">{lead.status}</Badge></td><td className="py-4 font-mono text-xs">${lead.estimated_value.toLocaleString()}</td><td className="py-4"><div className="flex justify-end gap-1"><Button aria-label={`Edit ${lead.first_name}`} variant="ghost" size="icon" onClick={() => editLead(lead)}><Pencil /></Button><Button aria-label={`Delete ${lead.first_name}`} variant="ghost" size="icon" onClick={() => setLeads((current) => current.filter((item) => item.id !== lead.id))}><Trash2 /></Button></div></td></tr>)}</tbody></table></div>}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
