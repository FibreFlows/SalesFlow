"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function UserAvatarLink() {
  const [name, setName] = useState("");

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return;
      const { data } = await supabase.from("user_profiles").select("full_name").eq("user_id", auth.user.id).maybeSingle();
      const metadata = auth.user.user_metadata as { full_name?: string };
      setName(data?.full_name || metadata.full_name || auth.user.email?.split("@")[0]?.replace(/[._-]+/g, " ") || "");
    };
    const frame = requestAnimationFrame(load);
    return () => cancelAnimationFrame(frame);
  }, []);

  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "SF";
  return <a href="/profile" aria-label={name ? `Open ${name} profile` : "Open profile"} title="Profile" className="grid size-9 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground transition hover:ring-4 hover:ring-primary/15">{initials}</a>;
}
