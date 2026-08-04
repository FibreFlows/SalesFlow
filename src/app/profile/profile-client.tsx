"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, BadgeCheck, LogIn, LogOut, Mail, Phone, Save, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

type Profile = { full_name: string; tech_id: string; afl_email: string; telus_email: string; contact_number: string; bio: string };
const DEFAULT_PROFILE: Profile = { full_name: "", tech_id: "", afl_email: "", telus_email: "", contact_number: "", bio: "" };

export function ProfileClient() {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [userId, setUserId] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) { setMessage("Sign in through Leads to open your profile."); return; }
      setUserId(auth.user.id);
      const { data } = await supabase.from("user_profiles").select("*").eq("user_id", auth.user.id).maybeSingle();
      const saved = (data || {}) as Partial<Profile>;
      const metadata = auth.user.user_metadata as Partial<Profile>;
      const emailName = auth.user.email?.split("@")[0]?.replace(/[._-]+/g, " ") || "";
      setProfile({ ...DEFAULT_PROFILE, ...metadata, ...saved, full_name: saved.full_name || metadata.full_name || emailName });
    };
    const frame = requestAnimationFrame(load);
    return () => cancelAnimationFrame(frame);
  }, []);

  const update = (field: keyof Profile, value: string) => setProfile((current) => ({ ...current, [field]: value }));
  const save = async () => {
    if (!userId) return;
    setSaving(true); setMessage("");
    const { error } = await createClient().from("user_profiles").upsert({ user_id: userId, ...profile, updated_at: new Date().toISOString() });
    setMessage(error ? `Could not save: ${error.message}` : "Profile saved securely to the cloud.");
    setSaving(false);
  };

  const signOut = async () => {
    await createClient().auth.signOut();
    location.href = "/pilot";
  };

  const initials = profile.full_name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "SF";

  return <main className="min-h-screen bg-background p-4 pb-24 text-foreground sm:p-8"><div className="mx-auto max-w-3xl"><div className="mb-6 flex items-center justify-between gap-3"><Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground"><ArrowLeft className="size-4" /> Dashboard</Link>{userId ? <Button variant="outline" onClick={signOut}><LogOut /> Sign out</Button> : <Link href="/pilot"><Button><LogIn /> Sign in</Button></Link>}</div><Card className="overflow-hidden rounded-[28px]"><div className="bg-gradient-to-br from-primary to-emerald-700 p-6 text-primary-foreground sm:p-8"><div className="grid size-20 place-items-center rounded-full border-4 border-white/30 bg-white/15 text-2xl font-semibold">{initials}</div><Badge className="mt-5 border-white/25 bg-white/15 text-white"><BadgeCheck className="size-3.5" /> SALESFLOW PROFILE</Badge><h1 className="mt-3 text-3xl font-semibold tracking-tight">{profile.full_name}</h1><p className="mt-2 max-w-xl text-sm leading-6 text-white/80">{profile.bio || "Add a short professional bio below."}</p></div><CardHeader><CardTitle className="flex items-center gap-2"><UserRound className="size-5 text-primary" /> Personal and work details</CardTitle><p className="text-sm text-muted-foreground">These details stay in your private account and are used on your reports.</p></CardHeader><CardContent className="space-y-4"><div className="grid gap-4 sm:grid-cols-2"><label className="text-xs font-medium text-muted-foreground">Full name<Input className="mt-1.5" value={profile.full_name} onChange={(e) => update("full_name", e.target.value)} /></label><label className="text-xs font-medium text-muted-foreground">Tech ID<Input className="mt-1.5" value={profile.tech_id} onChange={(e) => update("tech_id", e.target.value)} /></label><label className="text-xs font-medium text-muted-foreground"><span className="flex items-center gap-1"><Mail className="size-3" /> AFL email</span><Input className="mt-1.5" type="email" value={profile.afl_email} onChange={(e) => update("afl_email", e.target.value)} /></label><label className="text-xs font-medium text-muted-foreground"><span className="flex items-center gap-1"><Mail className="size-3" /> TELUS email</span><Input className="mt-1.5" type="email" value={profile.telus_email} onChange={(e) => update("telus_email", e.target.value)} /></label><label className="text-xs font-medium text-muted-foreground sm:col-span-2"><span className="flex items-center gap-1"><Phone className="size-3" /> Contact number</span><Input className="mt-1.5" type="tel" inputMode="tel" placeholder="Add your contact number" value={profile.contact_number} onChange={(e) => update("contact_number", e.target.value)} /></label></div><label className="block text-xs font-medium text-muted-foreground">Dashboard bio<textarea className="mt-1.5 min-h-28 w-full rounded-xl border border-input bg-background p-3 text-sm text-foreground" placeholder="Write a short professional bio" value={profile.bio} onChange={(e) => update("bio", e.target.value)} /></label>{message ? <p className="text-sm text-primary">{message}</p> : null}<Button className="w-full sm:w-auto" onClick={save} disabled={!userId || saving}><Save /> {saving ? "Saving..." : "Save profile"}</Button></CardContent></Card></div></main>;
}
