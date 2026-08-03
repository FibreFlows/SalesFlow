"use client";

import Link from "next/link";
import { ArrowRight, BadgeDollarSign, FileSpreadsheet } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { VERIFIED_OFFERS } from "@/lib/verified-offers";

type Plan = { id: string; name: string; category: string; price: string; summary: string };
export function BestPlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  useEffect(() => { const load = async () => { const { data } = await createClient().from("offer_plans").select("id,name,category,price,summary").eq("featured", true).order("updated_at", { ascending: false }).limit(2); setPlans((data || []) as Plan[]); }; const frame = requestAnimationFrame(load); return () => cancelAnimationFrame(frame); }, []);
  const cards = plans.length ? plans : VERIFIED_OFFERS;
  return <section className="mb-5 lg:hidden"><div className="mb-3 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[.12em] text-primary">Best plans</p><h2 className="mt-1 text-xl font-semibold">Offers to lead with</h2></div><Link href="/deals" className="flex items-center gap-1 text-xs font-semibold text-primary">Deals &amp; plans <ArrowRight className="size-3.5"/></Link></div><div className="grid grid-cols-2 gap-3">{cards.slice(0, 2).map((plan, index) => <Link href="/deals" key={plan.id} className="min-w-0 rounded-2xl border border-primary/15 bg-card p-4 shadow-sm"><span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">{index ? <FileSpreadsheet className="size-4"/> : <BadgeDollarSign className="size-4"/>}</span><p className="mt-3 truncate text-[10px] font-bold uppercase tracking-[.1em] text-primary">{plan.category}</p><p className="mt-1 line-clamp-2 text-sm font-semibold">{plan.name}</p><p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{plan.price || plan.summary}</p></Link>)}</div></section>;
}
