"use client";

import { useEffect, useState } from "react";

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

  useEffect(() => {
    const update = () => setParts(getParts());
    const frame = requestAnimationFrame(update);
    const timer = window.setInterval(update, 60000);
    return () => { cancelAnimationFrame(frame); window.clearInterval(timer); };
  }, []);

  return <div><p className="mb-2 text-xs font-bold uppercase tracking-[.08em] text-primary sm:text-sm">{parts ? `${parts.date} · ${parts.time}` : "Edmonton local time"}</p><h1 className="text-[2rem] font-semibold tracking-tight sm:text-4xl">{parts?.greeting || "Welcome"}, Sahil.</h1><p className="mt-1.5 text-sm text-muted-foreground sm:mt-2 sm:text-base">Here&apos;s what&apos;s moving across your fibre pipeline.</p></div>;
}
