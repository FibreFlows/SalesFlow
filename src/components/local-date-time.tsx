"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const TIME_ZONE = "America/Edmonton";

function getParts() {
  const now = new Date();
  const hour = Number(new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE, hour: "numeric", hour12: false }).format(now));
  return {
    date: new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE, weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(now),
    time: new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE, hour: "numeric", minute: "2-digit", timeZoneName: "short" }).format(now),
    greeting: hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening",
  };
}

export function LocalDateTime() {
  const [parts, setParts] = useState<{ date: string; time: string; greeting: string } | null>(null);
  const [profile, setProfile] = useState({ full_name: "", bio: "Your sales pipeline, workload and opportunities in one place." });

  useEffect(() => {
    const update = () => setParts(getParts());
    const frame = requestAnimationFrame(update);
    const timer = window.setInterval(update, 60000);
    return () => { cancelAnimationFrame(frame); window.clearInterval(timer); };
  }, []);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return;
      const { data } = await supabase.from("user_profiles").select("full_name,bio").eq("user_id", auth.user.id).maybeSingle();
      const metadata = auth.user.user_metadata as { full_name?: string; bio?: string };
      const emailName = auth.user.email?.split("@")[0]?.replace(/[._-]+/g, " ") || "";
      setProfile({ full_name: data?.full_name || metadata.full_name || emailName, bio: data?.bio || metadata.bio || "Your sales pipeline, workload and opportunities in one place." });
    };
    const frame = requestAnimationFrame(load);
    return () => cancelAnimationFrame(frame);
  }, []);

  const firstName = profile.full_name.trim().split(/\s+/)[0];
  return <div><p className="mb-2 text-xs font-bold uppercase tracking-[.08em] text-primary sm:text-sm">{parts ? `${parts.date} · ${parts.time}` : "Edmonton local time"}</p><h1 className="text-[2rem] font-semibold tracking-tight sm:text-4xl">{parts?.greeting || "Welcome"}{firstName ? `, ${firstName}` : ""}.</h1><div className="mt-1.5 flex items-start gap-2 sm:mt-2"><p className="max-w-xl text-sm text-muted-foreground sm:text-base">{profile.bio}</p><Link href="/profile" aria-label="Edit dashboard bio" className="mt-0.5 rounded-full p-1 text-primary hover:bg-primary/10"><Pencil className="size-3.5" /></Link></div></div>;
}
