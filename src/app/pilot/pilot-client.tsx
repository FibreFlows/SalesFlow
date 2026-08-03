"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Download, FileJson, LogOut, Pencil, Plus, Search, Trash2, Upload } from "lucide-react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
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
  ncid: string; ecid: string; ban: string; secondary_phone: string; address: string;
  preferred_contact_method: string; best_contact_time: string; current_services: string[]; sale_scope: string[];
  is_with_competitor: boolean; competitor_name: string; is_in_contract: boolean; contract_expiry_date: string | null;
  current_monthly_cost: number; customer_rating: number | null; last_contacted_at: string | null; next_follow_up_at: string | null; assigned_salesperson: string;
  created_at: string;
  updated_at: string;
};

const STORAGE_KEY = "salesflow.pilot.leads.v1";
const SERVICES = ["Fibre internet", "Copper internet", "Optik TV", "Home phone", "Security", "Mobility"];
const EMPTY_FORM = { first_name: "", last_name: "", company: "", email: "", phone: "", secondary_phone: "", ncid: "", ecid: "", ban: "", address: "", preferred_contact_method: "Phone", best_contact_time: "", current_services: [] as string[], sale_scope: [] as string[], is_with_competitor: false, competitor_name: "", is_in_contract: false, contract_expiry_date: "", current_monthly_cost: "", customer_rating: "", last_contacted_at: "", next_follow_up_at: "", assigned_salesperson: "", source: "", status: "new" as LeadStatus, estimated_value: "", notes: "" };

function downloadFile(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}

function csvCell(value: unknown) {
  return `"${String(Array.isArray(value) ? value.join(" | ") : value ?? "").replaceAll('"', '""')}"`;
}

export function PilotClient() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [analyticsNow] = useState(() => Date.now());
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const supabase = createClient();
    const load = async (activeUser: User | null) => {
      setUser(activeUser);
      if (!activeUser) { setReady(true); return; }
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as Lead[];
      if (stored.length) {
        const { error } = await supabase.from("leads").upsert(stored.map((lead) => ({ ...lead, owner_id: activeUser.id })));
        if (!error) localStorage.removeItem(STORAGE_KEY);
      }
      const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
      if (error) setMessage(error.message); else setLeads((data || []) as Lead[]);
      setReady(true);
    };
    supabase.auth.getUser().then(({ data }) => load(data.user));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => load(session?.user || null));
    return () => data.subscription.unsubscribe();
  }, []);

  const filteredLeads = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return leads;
    return leads.filter((lead) => [lead.first_name, lead.last_name, lead.company, lead.email, lead.phone, lead.secondary_phone, lead.ncid, lead.ecid, lead.ban, lead.competitor_name, lead.assigned_salesperson].some((value) => (value || "").toLowerCase().includes(needle)));
  }, [leads, query]);

  const analytics = useMemo(() => {
    const now = analyticsNow;
    const sixtyDays = now + 60 * 86400000;
    return {
      pipeline: leads.filter((lead) => lead.status !== "converted" && lead.status !== "unqualified").reduce((sum, lead) => sum + Number(lead.estimated_value || 0), 0),
      followUps: leads.filter((lead) => lead.next_follow_up_at && new Date(lead.next_follow_up_at).getTime() <= now).length,
      contracts: leads.filter((lead) => lead.contract_expiry_date && new Date(lead.contract_expiry_date).getTime() >= now && new Date(lead.contract_expiry_date).getTime() <= sixtyDays).length,
      fibre: leads.filter((lead) => lead.current_services?.includes("Copper internet") && lead.sale_scope?.includes("Fibre internet")).length,
    };
  }, [analyticsNow, leads]);

  function toggleService(field: "current_services" | "sale_scope", service: string) {
    setForm((current) => ({ ...current, [field]: current[field].includes(service) ? current[field].filter((item) => item !== service) : [...current[field], service] }));
  }

  async function submitLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    const now = new Date().toISOString();
    if (editingId) {
      const updated = { ...form, estimated_value: Number(form.estimated_value || 0), current_monthly_cost: Number(form.current_monthly_cost || 0), customer_rating: Number(form.customer_rating || 0) || null, contract_expiry_date: form.contract_expiry_date || null, last_contacted_at: form.last_contacted_at || null, next_follow_up_at: form.next_follow_up_at || null, updated_at: now };
      const { error } = await createClient().from("leads").update(updated).eq("id", editingId);
      if (error) { setMessage(`Could not save: ${error.message}`); setSaving(false); return; }
      setLeads((current) => current.map((lead) => lead.id === editingId ? { ...lead, ...updated } : lead));
    } else {
      if (!user) { setMessage("Your session expired. Please sign in again."); setSaving(false); return; }
      const lead = { id: crypto.randomUUID(), owner_id: user.id, ...form, estimated_value: Number(form.estimated_value || 0), current_monthly_cost: Number(form.current_monthly_cost || 0), customer_rating: Number(form.customer_rating || 0) || null, contract_expiry_date: form.contract_expiry_date || null, last_contacted_at: form.last_contacted_at || null, next_follow_up_at: form.next_follow_up_at || null, created_at: now, updated_at: now };
      const { error } = await createClient().from("leads").insert(lead);
      if (error) { setMessage(`Could not save: ${error.message}`); setSaving(false); return; }
      setLeads((current) => [lead, ...current]);
    }
    setEditingId(null);
    setForm(EMPTY_FORM);
    setMessage("Lead saved to the cloud.");
    setSaving(false);
  }

  async function authenticate(mode: "signin" | "signup") {
    const supabase = createClient();
    const result = mode === "signin" ? await supabase.auth.signInWithPassword({ email, password }) : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${location.origin}/pilot` } });
    if (result.error) setMessage(result.error.message); else if (mode === "signup" && !result.data.session) setMessage("Check your email to confirm the account, then sign in.");
  }

  function editLead(lead: Lead) {
    setEditingId(lead.id);
    setForm({ ...EMPTY_FORM, ...lead, contract_expiry_date: lead.contract_expiry_date?.slice(0, 10) || "", last_contacted_at: lead.last_contacted_at?.slice(0, 10) || "", next_follow_up_at: lead.next_follow_up_at?.slice(0, 10) || "", estimated_value: String(lead.estimated_value || ""), current_monthly_cost: String(lead.current_monthly_cost || ""), customer_rating: String(lead.customer_rating || "") });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function exportJson() {
    downloadFile(`salesflow-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify({ format: "salesflow-leads", version: 1, exported_at: new Date().toISOString(), leads }, null, 2), "application/json");
  }

  function exportCsv() {
    const fields: (keyof Lead)[] = ["id", "first_name", "last_name", "company", "ncid", "ecid", "ban", "email", "phone", "secondary_phone", "address", "preferred_contact_method", "best_contact_time", "current_services", "sale_scope", "is_with_competitor", "competitor_name", "is_in_contract", "contract_expiry_date", "current_monthly_cost", "customer_rating", "source", "status", "estimated_value", "last_contacted_at", "next_follow_up_at", "assigned_salesperson", "notes", "created_at", "updated_at"];
    const rows = [fields.join(","), ...leads.map((lead) => fields.map((field) => csvCell(lead[field])).join(","))];
    downloadFile(`salesflow-leads-${new Date().toISOString().slice(0, 10)}.csv`, rows.join("\r\n"), "text/csv;charset=utf-8");
  }

  async function importJson(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const payload = JSON.parse(await file.text()) as { format?: string; version?: number; leads?: Lead[] };
    if (payload.format !== "salesflow-leads" || payload.version !== 1 || !Array.isArray(payload.leads)) throw new Error("This is not a valid SalesFlow backup.");
    if (!user) return;
    const imported = payload.leads.map((lead) => ({ ...lead, owner_id: user.id }));
    const { error } = await createClient().from("leads").upsert(imported);
    if (error) { setMessage(error.message); return; }
    setLeads(payload.leads);
    setMessage(`${payload.leads.length} records restored to the cloud.`);
    event.target.value = "";
  }

  async function deleteLead(lead: Lead) {
    if (!window.confirm(`Delete ${lead.first_name} ${lead.last_name}?`)) return;
    const { error } = await createClient().from("leads").delete().eq("id", lead.id);
    if (error) { setMessage(error.message); return; }
    setLeads((current) => current.filter((item) => item.id !== lead.id));
  }

  if (ready && !user) return <main className="grid min-h-screen place-items-center bg-background p-5 text-foreground"><Card className="w-full max-w-md"><CardHeader><Badge className="w-fit border-primary/30 bg-primary/10 text-primary">CLOUD DATABASE</Badge><CardTitle className="pt-3 text-2xl">Sign in to SalesFlow</CardTitle></CardHeader><CardContent className="space-y-3"><Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} /><Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />{message ? <p className="text-sm text-primary">{message}</p> : null}<Button className="w-full" onClick={() => authenticate("signin")}>Sign in</Button><Button className="w-full" variant="outline" onClick={() => authenticate("signup")}>Create account</Button></CardContent></Card></main>;

  return (
    <main className="min-h-screen bg-background p-5 text-foreground sm:p-8">
      <div className="mx-auto max-w-7xl">
        <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Dashboard</Link>
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div><Badge className="border-primary/30 bg-primary/10 text-primary">CLOUD SALES TRACKER v0.4</Badge><h1 className="mt-3 text-3xl font-semibold tracking-tight">Telecom lead workspace</h1><p className="mt-2 text-sm text-muted-foreground">Your records are securely saved to your Supabase cloud account.</p></div>
          <div className="flex flex-wrap gap-2"><Button variant="outline" onClick={exportCsv}><Download /> CSV</Button><Button variant="outline" onClick={exportJson}><FileJson /> Backup</Button><Button variant="outline" onClick={() => fileRef.current?.click()}><Upload /> Restore</Button><Button variant="ghost" onClick={() => createClient().auth.signOut()}><LogOut /> Sign out</Button><input ref={fileRef} className="hidden" type="file" accept="application/json" onChange={importJson} /></div>
        </div>

        <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[['Active pipeline', `$${analytics.pipeline.toLocaleString()}`], ['Follow-ups due', analytics.followUps], ['Contracts expiring (60d)', analytics.contracts], ['Copper → Fibre', analytics.fibre]].map(([label, value]) => <Card key={label}><CardContent className="p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-semibold">{value}</p></CardContent></Card>)}
        </div>

        <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
          <Card>
            <CardHeader><CardTitle>{editingId ? "Edit lead" : "Add a lead"}</CardTitle></CardHeader>
            <CardContent>
              <form className="space-y-3" onSubmit={submitLead}>
                <p className="text-xs text-muted-foreground">All fields are optional for now. Add only the information you have.</p>
                <div className="grid grid-cols-2 gap-3"><Input aria-label="First name" placeholder="First name" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} /><Input aria-label="Last name" placeholder="Last name" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} /></div>
                <Input aria-label="Company" placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
                <div className="grid grid-cols-3 gap-3"><Input aria-label="NCID" placeholder="NCID" value={form.ncid} onChange={(e) => setForm({ ...form, ncid: e.target.value })} /><Input aria-label="ECID" placeholder="ECID" value={form.ecid} onChange={(e) => setForm({ ...form, ecid: e.target.value })} /><Input aria-label="BAN" placeholder="BAN" value={form.ban} onChange={(e) => setForm({ ...form, ban: e.target.value })} /></div>
                <Input type="email" aria-label="Email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <div className="grid grid-cols-2 gap-3"><Input aria-label="Phone" placeholder="Primary phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /><Input aria-label="Secondary phone" placeholder="Secondary phone" value={form.secondary_phone} onChange={(e) => setForm({ ...form, secondary_phone: e.target.value })} /></div>
                <Input aria-label="Address" placeholder="Service address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                <div className="grid grid-cols-2 gap-3"><select aria-label="Preferred contact" className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={form.preferred_contact_method} onChange={(e) => setForm({ ...form, preferred_contact_method: e.target.value })}><option>Phone</option><option>Text</option><option>Email</option><option>In person</option></select><Input aria-label="Best contact time" placeholder="Best time to contact" value={form.best_contact_time} onChange={(e) => setForm({ ...form, best_contact_time: e.target.value })} /></div>
                {([['current_services', 'Services customer has'], ['sale_scope', 'Scope of sale']] as const).map(([field, label]) => <fieldset key={field} className="rounded-md border border-input p-3"><legend className="px-1 text-xs font-medium">{label}</legend><div className="grid grid-cols-2 gap-2">{SERVICES.map((service) => <label key={service} className="flex items-center gap-2 text-xs"><input type="checkbox" checked={form[field].includes(service)} onChange={() => toggleService(field, service)} />{service}</label>)}</div></fieldset>)}
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_with_competitor} onChange={(e) => setForm({ ...form, is_with_competitor: e.target.checked })} /> Currently with a competitor</label>
                {form.is_with_competitor ? <Input aria-label="Competitor" placeholder="Competitor name" value={form.competitor_name} onChange={(e) => setForm({ ...form, competitor_name: e.target.value })} /> : null}
                <div className="grid grid-cols-2 gap-3"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_in_contract} onChange={(e) => setForm({ ...form, is_in_contract: e.target.checked })} /> In contract</label><Input type="date" min="2000-01-01" max="2100-12-31" aria-label="Contract expiry" value={form.contract_expiry_date} onChange={(e) => setForm({ ...form, contract_expiry_date: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3"><Input type="number" min="0" step="0.01" aria-label="Customer current monthly bill" placeholder="Current monthly bill ($)" title="What the customer currently pays each month" value={form.current_monthly_cost} onChange={(e) => setForm({ ...form, current_monthly_cost: e.target.value })} /><select aria-label="Customer rating" className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={form.customer_rating} onChange={(e) => setForm({ ...form, customer_rating: e.target.value })}><option value="">Customer rating</option>{[1,2,3,4,5].map((rating) => <option key={rating} value={rating}>{rating} / 5</option>)}</select></div>
                <div className="grid grid-cols-2 gap-3"><Input aria-label="Lead source" placeholder="Lead source (referral, door knock...)" title="Where this lead came from" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} /><Input type="number" min="0" step="0.01" aria-label="Estimated sale value" placeholder="Estimated sale value ($)" title="Expected value of this sale" value={form.estimated_value} onChange={(e) => setForm({ ...form, estimated_value: e.target.value })} /></div>
                <select aria-label="Lead status" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as LeadStatus })}><option value="new">New</option><option value="contacted">Contacted</option><option value="qualified">Qualified</option><option value="unqualified">Unqualified</option><option value="converted">Converted</option></select>
                <div className="grid grid-cols-2 gap-3"><label className="text-xs text-muted-foreground">Last contacted date (optional)<Input className="mt-1" type="date" min="2000-01-01" max="2100-12-31" value={form.last_contacted_at} onChange={(e) => setForm({ ...form, last_contacted_at: e.target.value })} /></label><label className="text-xs text-muted-foreground">Next follow-up date (optional)<Input className="mt-1" type="date" min="2000-01-01" max="2100-12-31" value={form.next_follow_up_at} onChange={(e) => setForm({ ...form, next_follow_up_at: e.target.value })} /></label></div>
                <Input aria-label="Assigned salesperson" placeholder="Assigned salesperson" value={form.assigned_salesperson} onChange={(e) => setForm({ ...form, assigned_salesperson: e.target.value })} />
                <textarea aria-label="Notes" className="min-h-24 w-full rounded-md border border-input bg-transparent p-3 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                {message ? <p role="status" className={`rounded-md p-3 text-sm ${message.startsWith("Could not") ? "bg-red-50 text-red-700" : "bg-primary/10 text-primary"}`}>{message}</p> : null}
                <div className="flex gap-2"><Button className="flex-1" type="submit" disabled={saving}><Plus /> {saving ? "Saving..." : editingId ? "Save changes" : "Add lead"}</Button>{editingId ? <Button type="button" variant="ghost" onClick={() => { setEditingId(null); setForm(EMPTY_FORM); }}>Cancel</Button> : null}</div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between"><div><CardTitle>Leads</CardTitle><p className="mt-1 text-sm text-muted-foreground">{leads.length} saved record{leads.length === 1 ? "" : "s"}</p></div><div className="relative sm:w-72"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" placeholder="Search leads..." value={query} onChange={(e) => setQuery(e.target.value)} /></div></CardHeader>
            <CardContent>
              {!ready ? <p className="py-12 text-center text-sm text-muted-foreground">Loading your records...</p> : filteredLeads.length === 0 ? <div className="py-14 text-center"><p className="font-medium">No leads found</p><p className="mt-2 text-sm text-muted-foreground">Add your first lead using the form.</p></div> : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b border-border text-xs text-muted-foreground"><tr><th className="pb-3 font-medium">Lead</th><th className="pb-3 font-medium">IDs / competitor</th><th className="pb-3 font-medium">Follow-up</th><th className="pb-3 font-medium">Status</th><th className="pb-3 font-medium">Value</th><th className="pb-3 text-right font-medium">Actions</th></tr></thead><tbody>{filteredLeads.map((lead) => <tr key={lead.id} className="border-b border-border/60 last:border-0"><td className="py-4"><p className="font-medium">{lead.first_name} {lead.last_name}</p><p className="mt-1 text-xs text-muted-foreground">{lead.company || lead.email || lead.phone || "No company or contact"}</p></td><td className="py-4 text-xs text-muted-foreground"><p>{lead.ncid || lead.ecid || lead.ban ? `NCID ${lead.ncid || '—'} · ECID ${lead.ecid || '—'} · BAN ${lead.ban || '—'}` : 'No IDs'}</p><p className="mt-1">{lead.competitor_name || 'No competitor'}</p></td><td className="py-4 text-xs">{lead.next_follow_up_at ? new Date(lead.next_follow_up_at).toLocaleString() : 'Not set'}</td><td className="py-4"><Badge className="border-primary/20 bg-primary/10 capitalize text-primary">{lead.status}</Badge></td><td className="py-4 font-mono text-xs">${Number(lead.estimated_value || 0).toLocaleString()}</td><td className="py-4"><div className="flex justify-end gap-1"><Button aria-label={`Edit ${lead.first_name}`} variant="ghost" size="icon" onClick={() => editLead(lead)}><Pencil /></Button><Button aria-label={`Delete ${lead.first_name}`} variant="ghost" size="icon" onClick={() => deleteLead(lead)}><Trash2 /></Button></div></td></tr>)}</tbody></table></div>}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
